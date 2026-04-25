import prisma from '../prisma/client.js';
import { normalizeOccasions } from '../constants/occasions.js';
import { uploadProductImage } from '../utils/supabaseStorage.js';
import { notifyEmergency } from '../utils/telegram.js';

const CYRILLIC_MAP = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya', қ: 'q', ғ: 'g', ң: 'n',
  ә: 'a', ө: 'o', ұ: 'u', ү: 'u', і: 'i', һ: 'h'
};

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const slugify = (value) => {
  const transliterated = String(value || '')
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_MAP[char] || char)
    .join('');

  return transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
};

const buildUniqueSlug = async (title, fallback, excludeId) => {
  const base = slugify(title) || `product-${fallback}`;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const existing = await prisma.product.findUnique({ where: { slug } });

    if (!existing || existing.id === excludeId) {
      return slug;
    }
  }

  return `${base}-${Date.now()}`;
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  const { idOrSlug } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug },
      include: { reviews: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// Create product
export const createProduct = async (req, res) => {
  const { title, price, description, imageUrl, image: bodyImage, occasions: rawOccasions } = req.body;

  try {
    // Get next index
    const lastProduct = await prisma.product.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    const nextIndex = lastProduct
      ? String(parseInt(lastProduct.index) + 1).padStart(2, '0')
      : '01';

    const image = imageUrl || bodyImage || '';
    const occasions = normalizeOccasions(rawOccasions);
    const slug = await buildUniqueSlug(title, nextIndex);

    const product = await prisma.product.create({
      data: {
        index: nextIndex,
        slug,
        title,
        price,
        description,
        image,
        occasions
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, description, imageUrl, image: bodyImage, occasions: rawOccasions } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const image = imageUrl || bodyImage || product.image;
    const occasions = rawOccasions === undefined
      ? product.occasions
      : normalizeOccasions(rawOccasions);
    const slug = product.slug || await buildUniqueSlug(title || product.title, product.index, product.id);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        slug,
        title: title || product.title,
        price: price || product.price,
        description: description || product.description,
        image,
        occasions
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Upload image to Supabase Storage and return a public URL
export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const uploaded = await uploadProductImage(req.file);

    res.json({
      url: uploaded.url,
      path: uploaded.path,
      success: true
    });
  } catch (error) {
    console.error('Upload error:', error);
    await notifyEmergency('Ошибка загрузки фото', error.message || 'Failed to upload image');
    res.status(error.status || 500).json({ message: error.message || 'Failed to upload image' });
  }
};
