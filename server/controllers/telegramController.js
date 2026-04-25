import { handleTelegramUpdate, notifyEmergency } from '../utils/telegram.js';

export const telegramWebhook = async (req, res) => {
  const { secret } = req.params;

  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await handleTelegramUpdate(req.body);
    res.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    await notifyEmergency('Telegram webhook error', error.message || 'Unknown webhook error');
    res.status(500).json({ message: 'Telegram webhook failed' });
  }
};
