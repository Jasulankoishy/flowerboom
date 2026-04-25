import prisma from '../prisma/client.js';
import { notifyEmergency, notifyNewOrder } from '../utils/telegram.js';
import { applyPromoCode, normalizePromoCode } from '../utils/promoCodes.js';

const parsePrice = (value) => {
  const normalized = String(value || '').replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const price = Number.parseFloat(normalized);
  return Number.isFinite(price) ? price : 0;
};

const ACTIVE_REVENUE_STATUSES = ['pending', 'accepted', 'confirmed', 'preparing', 'delivering', 'delivered'];
const VALID_ORDER_STATUSES = ['pending', 'accepted', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];
const ORDER_INCLUDE = {
  items: {
    include: {
      product: true
    }
  },
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true
    }
  }
};

const getTodayDateString = () => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Qyzylorda',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
};

const createClientError = (message) => Object.assign(new Error(message), { statusCode: 400 });

// Create order
export const createOrder = async (req, res) => {
  const {
    items,
    city,
    street,
    house,
    apartment,
    phone,
    deliveryDate,
    deliveryTime,
    giftCardEnabled = false,
    giftMessage = '',
    promoCode: rawPromoCode = '',
    idempotencyKey: rawIdempotencyKey = ''
  } = req.body;

  try {
    const idempotencyKey = String(rawIdempotencyKey || '').trim().slice(0, 120) || null;

    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: ORDER_INCLUDE
      });

      if (existingOrder) {
        if (existingOrder.userId !== req.user.userId) {
          return res.status(409).json({ error: 'Order key already used' });
        }

        return res.status(200).json(existingOrder);
      }
    }

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }
    if (!city || city.trim().length < 2) {
      return res.status(400).json({ error: 'City must be at least 2 characters' });
    }
    if (!street || street.trim().length < 3) {
      return res.status(400).json({ error: 'Street must be at least 3 characters' });
    }
    if (!house || house.trim().length === 0) {
      return res.status(400).json({ error: 'House number is required' });
    }
    if (!phone || !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone must be in format: +7 (XXX) XXX-XX-XX' });
    }
    if (!deliveryDate) {
      return res.status(400).json({ error: 'Delivery date is required' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) {
      return res.status(400).json({ error: 'Delivery date must be in YYYY-MM-DD format' });
    }

    if (deliveryDate < getTodayDateString()) {
      return res.status(400).json({ error: 'Delivery date cannot be in the past' });
    }

    if (!deliveryTime) {
      return res.status(400).json({ error: 'Delivery time is required' });
    }
    // Verify all products exist
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Some products not found' });
    }

    const productMap = new Map(products.map(product => [product.id, product]));
    const normalizedItems = items.map(item => {
      const quantity = Number.parseInt(item.quantity, 10);
      const product = productMap.get(item.productId);

      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return null;
      }

      return {
        productId: item.productId,
        quantity,
        price: product.price,
        lineTotal: parsePrice(product.price) * quantity
      };
    });

    if (normalizedItems.some(item => item === null)) {
      return res.status(400).json({ error: 'Invalid order items' });
    }

    const originalTotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const cleanGiftMessage = giftCardEnabled ? String(giftMessage || '').trim().slice(0, 300) : null;
    const normalizedPromoCode = normalizePromoCode(rawPromoCode);

    const order = await prisma.$transaction(async (tx) => {
      const promoResult = await applyPromoCode(rawPromoCode, originalTotal, tx);

      if (normalizedPromoCode && !promoResult.promoCode) {
        throw createClientError(
          promoResult.reason === 'limit_reached'
            ? 'Лимит использований промокода закончился'
            : 'Промокод не найден, выключен или истёк'
        );
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: req.user.userId,
          city: city.trim(),
          street: street.trim(),
          house: house.trim(),
          apartment: apartment?.trim() || null,
          phone: phone.trim(),
          deliveryDate,
          deliveryTime,
          originalTotalPrice: originalTotal.toFixed(2),
          discountAmount: promoResult.discount.toFixed(2),
          promoCode: promoResult.promoCode ? normalizedPromoCode : null,
          totalPrice: promoResult.finalTotal.toFixed(2),
          giftCardEnabled: Boolean(giftCardEnabled),
          giftMessage: cleanGiftMessage,
          idempotencyKey,
          status: 'pending',
          items: {
            create: normalizedItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: ORDER_INCLUDE
      });

      if (promoResult.promoCode) {
        const limitGuard = promoResult.promoCode.maxUses === null || promoResult.promoCode.maxUses === undefined
          ? {}
          : {
              OR: [
                { maxUses: null },
                { usedCount: { lt: promoResult.promoCode.maxUses } }
              ]
            };

        const promoUpdate = await tx.promoCode.updateMany({
          where: {
            id: promoResult.promoCode.id,
            ...limitGuard
          },
          data: {
            usedCount: {
              increment: 1
            }
          }
        });

        if (promoUpdate.count !== 1) {
          throw createClientError('Лимит использований промокода закончился');
        }
      }

      return createdOrder;
    });

    notifyNewOrder(order);
    res.status(201).json(order);
  } catch (error) {
    if (error.code === 'P2002' && rawIdempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey: String(rawIdempotencyKey).trim().slice(0, 120) },
        include: ORDER_INCLUDE
      });

      if (existingOrder && existingOrder.userId === req.user.userId) {
        return res.status(200).json(existingOrder);
      }
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Create order error:', error);
    await notifyEmergency('Ошибка создания заказа', error.message || 'Failed to create order');
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  const { status } = req.query;

  try {
    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [productsCount, ordersToday, pendingOrders, revenueOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.order.count({
        where: { status: 'pending' }
      }),
      prisma.order.findMany({
        where: {
          status: { in: ACTIVE_REVENUE_STATUSES }
        },
        select: { totalPrice: true }
      })
    ]);

    const totalRevenue = revenueOrders.reduce((sum, order) => {
      const value = Number.parseFloat(String(order.totalPrice || '0').replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, ''));
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

    res.json({
      productsCount,
      ordersToday,
      pendingOrders,
      totalRevenue: totalRevenue.toFixed(2)
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Validate status
    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
