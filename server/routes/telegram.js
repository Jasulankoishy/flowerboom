import express from 'express';
import { telegramWebhook } from '../controllers/telegramController.js';

const router = express.Router();

router.post('/telegram/webhook/:secret', telegramWebhook);

export default router;
