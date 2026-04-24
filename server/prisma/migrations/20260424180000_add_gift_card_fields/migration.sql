-- Add optional gift card details to orders.
ALTER TABLE "Order" ADD COLUMN "giftCardEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "giftMessage" TEXT;
