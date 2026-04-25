ALTER TABLE "Product" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN "availability" TEXT NOT NULL DEFAULT 'in_stock';
