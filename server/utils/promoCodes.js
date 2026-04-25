import prisma from '../prisma/client.js';

export const normalizePromoCode = (code) => String(code || '').trim().toUpperCase();

export const parseMoney = (value) => {
  const normalized = String(value || '').replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const money = Number.parseFloat(normalized);
  return Number.isFinite(money) ? money : 0;
};

export const findUsablePromoCode = async (code, db = prisma) => {
  const normalizedCode = normalizePromoCode(code);
  if (!normalizedCode) return { promoCode: null, reason: 'empty' };

  const promoCode = await db.promoCode.findUnique({
    where: { code: normalizedCode }
  });

  if (!promoCode) return { promoCode: null, reason: 'not_found' };
  if (!promoCode.isActive) return { promoCode: null, reason: 'inactive' };
  if (promoCode.expiresAt && promoCode.expiresAt < new Date()) return { promoCode: null, reason: 'expired' };
  if (promoCode.maxUses !== null && promoCode.maxUses !== undefined && promoCode.usedCount >= promoCode.maxUses) {
    return { promoCode: null, reason: 'limit_reached' };
  }

  return { promoCode, reason: null };
};

export const calculateDiscount = (promoCode, originalTotal) => {
  if (!promoCode || originalTotal <= 0) return 0;

  const rawDiscount = promoCode.type === 'percent'
    ? originalTotal * (Number(promoCode.value) / 100)
    : Number(promoCode.value);

  if (!Number.isFinite(rawDiscount) || rawDiscount <= 0) return 0;
  return Math.min(originalTotal, rawDiscount);
};

export const applyPromoCode = async (code, originalTotal, db = prisma) => {
  const { promoCode, reason } = await findUsablePromoCode(code, db);
  const discount = calculateDiscount(promoCode, originalTotal);
  const finalTotal = Math.max(0, originalTotal - discount);

  return {
    promoCode,
    reason,
    discount,
    finalTotal
  };
};
