import prisma from '../prisma/client.js';

export const normalizePromoCode = (code) => String(code || '').trim().toUpperCase();

export const parseMoney = (value) => {
  const normalized = String(value || '').replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const money = Number.parseFloat(normalized);
  return Number.isFinite(money) ? money : 0;
};

export const findUsablePromoCode = async (code) => {
  const normalizedCode = normalizePromoCode(code);
  if (!normalizedCode) return null;

  const promoCode = await prisma.promoCode.findUnique({
    where: { code: normalizedCode }
  });

  if (!promoCode || !promoCode.isActive) return null;
  if (promoCode.expiresAt && promoCode.expiresAt < new Date()) return null;

  return promoCode;
};

export const calculateDiscount = (promoCode, originalTotal) => {
  if (!promoCode || originalTotal <= 0) return 0;

  const rawDiscount = promoCode.type === 'percent'
    ? originalTotal * (Number(promoCode.value) / 100)
    : Number(promoCode.value);

  if (!Number.isFinite(rawDiscount) || rawDiscount <= 0) return 0;
  return Math.min(originalTotal, rawDiscount);
};

export const applyPromoCode = async (code, originalTotal) => {
  const promoCode = await findUsablePromoCode(code);
  const discount = calculateDiscount(promoCode, originalTotal);
  const finalTotal = Math.max(0, originalTotal - discount);

  return {
    promoCode,
    discount,
    finalTotal
  };
};
