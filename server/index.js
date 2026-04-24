import dotenv from 'dotenv';
import app from './app.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureAdmin } from './utils/ensureAdmin.js';

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3003;
const HOST = process.env.HOST || 'localhost';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

await ensureAdmin();

app.listen(PORT, () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n👤 Frontend: ${frontendUrl}`);
  console.log(`🔐 Admin Panel: ${frontendUrl}/admin/login`);
  console.log(`   Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
});
