ALTER TABLE "Order" ADD COLUMN "originalTotalPrice" TEXT;
ALTER TABLE "Order" ADD COLUMN "discountAmount" TEXT;
ALTER TABLE "Order" ADD COLUMN "promoCode" TEXT;

CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
