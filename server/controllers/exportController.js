import prisma from '../prisma/client.js';

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

const exportStamp = () => new Date().toISOString().slice(0, 10);

const csvCell = (value) => {
  const normalized = Array.isArray(value) ? value.join(', ') : String(value ?? '');
  return `"${normalized.replace(/"/g, '""')}"`;
};

const sendDownload = (res, { filename, contentType, body }) => {
  res
    .status(200)
    .set('Content-Type', contentType)
    .set('Content-Disposition', `attachment; filename="${filename}"`)
    .send(body);
};

const productsToCsv = (products) => {
  const headers = ['id', 'index', 'slug', 'title', 'price', 'description', 'occasions', 'image', 'createdAt', 'updatedAt'];
  const rows = products.map((product) => [
    product.id,
    product.index,
    product.slug || '',
    product.title,
    product.price,
    product.description,
    product.occasions,
    product.image,
    product.createdAt?.toISOString?.() || product.createdAt,
    product.updatedAt?.toISOString?.() || product.updatedAt
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
};

const ordersToCsv = (orders) => {
  const headers = [
    'id',
    'status',
    'clientName',
    'clientEmail',
    'phone',
    'address',
    'deliveryDate',
    'deliveryTime',
    'items',
    'originalTotalPrice',
    'discountAmount',
    'promoCode',
    'totalPrice',
    'giftCardEnabled',
    'giftMessage',
    'createdAt',
    'updatedAt'
  ];

  const rows = orders.map((order) => {
    const address = `${order.city}, ${order.street}, д. ${order.house}${order.apartment ? `, кв. ${order.apartment}` : ''}`;
    const items = order.items
      .map((item) => `${item.product?.title || item.productId} x${item.quantity} (${item.price})`)
      .join('; ');

    return [
      order.id,
      order.status,
      order.user?.name || '',
      order.user?.email || '',
      order.phone,
      address,
      order.deliveryDate,
      order.deliveryTime,
      items,
      order.originalTotalPrice || '',
      order.discountAmount || '',
      order.promoCode || '',
      order.totalPrice,
      order.giftCardEnabled ? 'yes' : 'no',
      order.giftMessage || '',
      order.createdAt?.toISOString?.() || order.createdAt,
      order.updatedAt?.toISOString?.() || order.updatedAt
    ];
  });

  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
};

export const exportProducts = async (req, res) => {
  const format = String(req.query.format || 'json').toLowerCase();

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    });

    if (format === 'csv') {
      return sendDownload(res, {
        filename: `flowerboom-products-${exportStamp()}.csv`,
        contentType: 'text/csv; charset=utf-8',
        body: `\uFEFF${productsToCsv(products)}`
      });
    }

    return sendDownload(res, {
      filename: `flowerboom-products-${exportStamp()}.json`,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ exportedAt: new Date().toISOString(), products }, null, 2)
    });
  } catch (error) {
    console.error('Export products error:', error);
    res.status(500).json({ error: 'Failed to export products' });
  }
};

export const exportOrders = async (req, res) => {
  const format = String(req.query.format || 'json').toLowerCase();

  try {
    const orders = await prisma.order.findMany({
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      return sendDownload(res, {
        filename: `flowerboom-orders-${exportStamp()}.csv`,
        contentType: 'text/csv; charset=utf-8',
        body: `\uFEFF${ordersToCsv(orders)}`
      });
    }

    return sendDownload(res, {
      filename: `flowerboom-orders-${exportStamp()}.json`,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ exportedAt: new Date().toISOString(), orders }, null, 2)
    });
  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({ error: 'Failed to export orders' });
  }
};
