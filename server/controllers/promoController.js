import prisma from '../prisma/client.js';
import { applyPromoCode, normalizePromoCode, parseMoney } from '../utils/promoCodes.js';

const VALID_TYPES = ['percent', 'fixed'];

const getPayload = (body) => {
  const code = normalizePromoCode(body.code);
  const type = String(body.type || '').trim();
  const value = Number.parseFloat(String(body.value || '0').replace(',', '.'));
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  const maxUsesValue = body.maxUses === '' || body.maxUses === null || body.maxUses === undefined
    ? null
    : Number.parseInt(body.maxUses, 10);

  return {
    code,
    type,
    value,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
    maxUses: Number.isInteger(maxUsesValue) ? maxUsesValue : null
  };
};

const validatePayload = (payload) => {
  if (!payload.code || payload.code.length < 3 || payload.code.length > 32) {
    return 'Promo code must be 3-32 characters';
  }
  if (!VALID_TYPES.includes(payload.type)) {
    return 'Promo code type must be percent or fixed';
  }
  if (!Number.isFinite(payload.value) || payload.value <= 0) {
    return 'Promo code value must be greater than 0';
  }
  if (payload.type === 'percent' && payload.value > 100) {
    return 'Percent promo code cannot be greater than 100';
  }
  if (payload.maxUses !== null && payload.maxUses < 1) {
    return 'Promo code usage limit must be at least 1';
  }
  return null;
};

const getPromoErrorMessage = (reason) => {
  if (reason === 'expired') return 'Промокод истёк';
  if (reason === 'limit_reached') return 'Лимит использований промокода закончился';
  if (reason === 'inactive') return 'Промокод выключен';
  return 'Промокод не найден';
};

export const validatePromoCode = async (req, res) => {
  const { code, totalPrice } = req.body;
  const originalTotal = parseMoney(totalPrice);

  if (!code || originalTotal <= 0) {
    return res.status(400).json({ message: 'Promo code and total price are required' });
  }

  try {
    const result = await applyPromoCode(code, originalTotal);

    if (!result.promoCode || result.discount <= 0) {
      return res.status(404).json({ message: getPromoErrorMessage(result.reason) });
    }

    res.json({
      code: result.promoCode.code,
      type: result.promoCode.type,
      value: result.promoCode.value,
      maxUses: result.promoCode.maxUses,
      usedCount: result.promoCode.usedCount,
      originalTotal: originalTotal.toFixed(2),
      discountAmount: result.discount.toFixed(2),
      totalPrice: result.finalTotal.toFixed(2)
    });
  } catch (error) {
    console.error('Validate promo error:', error);
    res.status(500).json({ message: 'Failed to validate promo code' });
  }
};

export const getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(promoCodes);
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({ message: 'Failed to fetch promo codes' });
  }
};

export const createPromoCode = async (req, res) => {
  const payload = getPayload(req.body);
  const validationError = validatePayload(payload);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const promoCode = await prisma.promoCode.create({ data: payload });
    res.status(201).json(promoCode);
  } catch (error) {
    console.error('Create promo code error:', error);
    const status = error.code === 'P2002' ? 409 : 500;
    res.status(status).json({ message: status === 409 ? 'Промокод уже существует' : 'Failed to create promo code' });
  }
};

export const updatePromoCode = async (req, res) => {
  const { id } = req.params;
  const payload = getPayload(req.body);
  const validationError = validatePayload(payload);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: payload
    });
    res.json(promoCode);
  } catch (error) {
    console.error('Update promo code error:', error);
    res.status(500).json({ message: 'Failed to update promo code' });
  }
};

export const deletePromoCode = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.promoCode.delete({ where: { id } });
    res.json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    console.error('Delete promo code error:', error);
    res.status(500).json({ message: 'Failed to delete promo code' });
  }
};
