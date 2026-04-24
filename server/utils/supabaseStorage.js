import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

export const isStorageConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

export const supabase = isStorageConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

const extensionByMime = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

export async function ensureStorageBucket() {
  if (!supabase) {
    console.warn('Supabase Storage is not configured. Image uploads will return an error.');
    return;
  }

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Failed to list Supabase buckets:', listError.message);
    return;
  }

  const bucketExists = buckets.some((bucket) => bucket.name === STORAGE_BUCKET);
  if (bucketExists) return;

  const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  });

  if (createError) {
    console.error('Failed to create Supabase bucket:', createError.message);
    return;
  }

  console.log(`Supabase Storage bucket ready: ${STORAGE_BUCKET}`);
}

export async function uploadProductImage(file) {
  if (!supabase) {
    const error = new Error('Supabase Storage is not configured');
    error.status = 503;
    throw error;
  }

  const extension = extensionByMime[file.mimetype] || 'jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extension}`;
  const path = `products/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (uploadError) {
    const error = new Error(uploadError.message || 'Failed to upload image');
    error.status = 500;
    throw error;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return {
    path,
    url: data.publicUrl
  };
}
