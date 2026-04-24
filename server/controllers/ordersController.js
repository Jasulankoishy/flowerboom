import prisma from '../prisma/client.js';

const parsePrice = (value) => {
  const normalized = String(value || '').replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const price = Number.parseFloat(normalized);
  return Number.isFinite(price) ? price : 0;
};

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
    giftMessage = ''
  } = req.body;

  try {
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

    // Check delivery date is not in the past (tomorrow or later)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const selectedDate = new Date(deliveryDate);
    if (selectedDate < tomorrow) {
      return res.status(400).json({ error: 'Delivery date must be tomorrow or later' });
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

    const computedTotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2);
    const cleanGiftMessage = giftCardEnabled ? String(giftMessage || '').trim().slice(0, 300) : null;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: req.user.userId,
        city: city.trim(),
        street: street.trim(),
        house: house.trim(),
        apartment: apartment?.trim() || null,
        phone: phone.trim(),
        deliveryDate,
        deliveryTime,
        totalPrice: computedTotal,
        giftCardEnabled: Boolean(giftCardEnabled),
        giftMessage: cleanGiftMessage,
        status: 'pending',
        items: {
          create: normalizedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
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
            email: true
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
            email: true
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
          status: {
            in: ['pending', 'confirmed', 'delivered']
          }
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
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: pending, confirmed, delivered, or cancelled' });
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
            email: true
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
