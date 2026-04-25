ALTER TABLE "Product" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
