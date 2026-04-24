import bcrypt from 'bcrypt';
import prisma from '../prisma/client.js';

export async function ensureAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.warn('ADMIN_PASSWORD is not set. Admin account sync skipped.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { username },
    update: { password: hashedPassword },
    create: {
      username,
      password: hashedPassword
    }
  });

  console.log(`Admin account synced: ${username}`);
}
