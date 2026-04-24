import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create default admin
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

    const admin = await prisma.admin.upsert({
      where: { username: process.env.ADMIN_USERNAME || 'admin' },
      update: {
        password: adminPassword
      },
      create: {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: adminPassword
      }
    });
    console.log('✅ Admin created:', admin.username);

    // Create default products with external image URLs
    const products = [
      {
        index: '1',
        title: 'Букет роз "Романтика"',
        price: '2990₽',
        image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80',
        description: 'Роскошный букет из красных роз — классика романтики'
      },
      {
        index: '2',
        title: 'Букет тюльпанов "Весна"',
        price: '2490₽',
        image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80',
        description: 'Нежные тюльпаны — символ весны и обновления'
      },
      {
        index: '3',
        title: 'Букет пионов "Нежность"',
        price: '3990₽',
        image: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=800&q=80',
        description: 'Пышные пионы — воплощение нежности и красоты'
      }
    ];

    for (const product of products) {
      // Check if product with this index already exists
      const existing = await prisma.product.findFirst({
        where: { index: product.index }
      });

      if (!existing) {
        await prisma.product.create({
          data: product
        });
      }
    }
    console.log(`✅ Created ${products.length} products`);

    console.log('🎉 Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
