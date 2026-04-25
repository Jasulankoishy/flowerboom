import prisma from '../prisma/client.js';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';
const ADMIN_STATUSES = ['accepted', 'preparing', 'delivering', 'delivered', 'cancelled'];

const STATUS_LABELS = {
  pending: 'Новый',
  accepted: 'Принят',
  confirmed: 'Принят',
  preparing: 'Собираем',
  delivering: 'В доставке',
  delivered: 'Доставлен',
  cancelled: 'Отменён'
};

const getConfig = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    return null;
  }

  return { token, chatId };
};

const telegramRequest = async (method, payload) => {
  const config = getConfig();
  if (!config) return null;

  const response = await fetch(`${TELEGRAM_API_BASE}${config.token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Telegram ${method} failed: ${response.status} ${body}`);
  }

  return response.json();
};

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const getClientName = (order) => {
  return order.user?.name || order.user?.email || 'Клиент';
};

export const formatOrderMessage = (order) => {
  const itemsText = order.items
    .map((item) => {
      const title = item.product?.title || 'Товар';
      return `• ${escapeHtml(title)} × ${item.quantity} — ${escapeHtml(item.price)}`;
    })
    .join('\n');

  const apartment = order.apartment ? `, кв. ${order.apartment}` : '';
  const giftText = order.giftCardEnabled
    ? `Да${order.giftMessage ? `\nТекст: ${escapeHtml(order.giftMessage)}` : ''}`
    : 'Нет';

  return [
    `🌸 <b>Новый заказ #${escapeHtml(order.id.slice(0, 8))}</b>`,
    '',
    `<b>Клиент:</b> ${escapeHtml(getClientName(order))}`,
    `<b>Email:</b> ${escapeHtml(order.user?.email || 'Не указан')}`,
    `<b>Телефон:</b> ${escapeHtml(order.phone)}`,
    `<b>Адрес:</b> ${escapeHtml(`${order.city}, ${order.street}, д. ${order.house}${apartment}`)}`,
    `<b>Доставка:</b> ${escapeHtml(`${order.deliveryDate}, ${order.deliveryTime}`)}`,
    '',
    '<b>Товары:</b>',
    itemsText || 'Нет товаров',
    '',
    `<b>Открытка:</b> ${giftText}`,
    '',
    `<b>Сумма:</b> ${escapeHtml(order.totalPrice)}₽`
  ].join('\n');
};

export const getOrderStatusKeyboard = (orderId) => ({
  inline_keyboard: [
    [
      { text: 'Принять', callback_data: `order_status:${orderId}:accepted` },
      { text: 'Собираем', callback_data: `order_status:${orderId}:preparing` }
    ],
    [
      { text: 'В доставке', callback_data: `order_status:${orderId}:delivering` },
      { text: 'Доставлен', callback_data: `order_status:${orderId}:delivered` }
    ],
    [
      { text: 'Отменить', callback_data: `order_status:${orderId}:cancelled` }
    ]
  ]
});

export const notifyNewOrder = async (order) => {
  if (!getConfig()) return;

  try {
    await telegramRequest('sendMessage', {
      chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
      text: formatOrderMessage(order),
      parse_mode: 'HTML',
      reply_markup: getOrderStatusKeyboard(order.id)
    });
  } catch (error) {
    console.error('Telegram new order notification error:', error);
  }
};

export const notifyEmergency = async (title, details = '') => {
  if (!getConfig()) return;

  try {
    await telegramRequest('sendMessage', {
      chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
      text: `🚨 <b>${escapeHtml(title)}</b>\n\n${escapeHtml(details).slice(0, 3000)}`,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.error('Telegram emergency notification error:', error);
  }
};

export const handleTelegramUpdate = async (update) => {
  const callback = update?.callback_query;
  if (!callback) {
    return { ok: true, ignored: true };
  }

  const adminChatId = String(process.env.TELEGRAM_ADMIN_CHAT_ID || '');
  const callbackUserId = String(callback.from?.id || '');

  if (!adminChatId || callbackUserId !== adminChatId) {
    await telegramRequest('answerCallbackQuery', {
      callback_query_id: callback.id,
      text: 'Нет доступа',
      show_alert: true
    }).catch(() => null);
    return { ok: false, unauthorized: true };
  }

  const [, orderId, status] = String(callback.data || '').split(':');
  if (!orderId || !ADMIN_STATUSES.includes(status)) {
    await telegramRequest('answerCallbackQuery', {
      callback_query_id: callback.id,
      text: 'Неизвестная команда',
      show_alert: true
    }).catch(() => null);
    return { ok: false, invalid: true };
  }

  const order = await prisma.order.update({
    where: { id: orderId },
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

  await telegramRequest('answerCallbackQuery', {
    callback_query_id: callback.id,
    text: `Статус: ${STATUS_LABELS[status]}`,
    show_alert: false
  });

  await telegramRequest('sendMessage', {
    chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
    text: `✅ Заказ #${escapeHtml(order.id.slice(0, 8))}: <b>${escapeHtml(STATUS_LABELS[status])}</b>`,
    parse_mode: 'HTML'
  });

  return { ok: true, order };
};
