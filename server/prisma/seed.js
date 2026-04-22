import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create default admin
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

    const admin = await prisma.admin.upsert({
      where: { username: process.env.ADMIN_USERNAME || 'admin' },
      update: {},
      create: {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: adminPassword
      }
    });
    console.log('✅ Admin created:', admin.username);

    // Migrate products from JSON
    const productsFile = path.join(__dirname, '../data/products.json');
    let productsData = [];

    if (fs.existsSync(productsFile)) {
      productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

      for (const product of productsData) {
        // Проверяем существование по index вместо id
        const existing = await prisma.product.findFirst({
          where: { index: product.index }
        });

        if (!existing) {
          await prisma.product.create({
            data: {
              index: product.index,
              title: product.title,
              image: product.image,
              price: product.price,
              description: product.description
            }
          });
        }
      }
      console.log(`✅ Migrated ${productsData.length} products`);
    }

    // Migrate reviews from JSON (if exists)
    const reviewsFile = path.join(__dirname, '../data/reviews.json');
    if (fs.existsSync(reviewsFile)) {
      const reviewsData = JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));

      for (const review of reviewsData) {
        // Найти продукт по старому id из JSON
        const oldProduct = productsData.find(p => p.id === review.productId);
        if (!oldProduct) continue;

        const product = await prisma.product.findFirst({
          where: { index: oldProduct.index }
        });

        if (product) {
          await prisma.review.create({
            data: {
              productId: product.id,
              rating: review.rating,
              comment: review.comment,
              userName: review.userName
            }
          });
        }
      }
      console.log(`✅ Migrated ${reviewsData.length} reviews`);
    }

    console.log('🎉 Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
