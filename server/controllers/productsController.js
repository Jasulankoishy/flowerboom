import prisma from '../prisma/client.js';
import { uploadProductImage } from '../utils/supabaseStorage.js';

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
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
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
  const { title, price, description, imageUrl, image: bodyImage } = req.body;

  try {
    // Get next index
    const lastProduct = await prisma.product.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    const nextIndex = lastProduct
      ? String(parseInt(lastProduct.index) + 1).padStart(2, '0')
      : '01';

    const image = imageUrl || bodyImage || '';

    const product = await prisma.product.create({
      data: {
        index: nextIndex,
        title,
        price,
        description,
        image
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
  const { title, price, description, imageUrl, image: bodyImage } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const image = imageUrl || bodyImage || product.image;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: title || product.title,
        price: price || product.price,
        description: description || product.description,
        image
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
    res.status(error.status || 500).json({ message: error.message || 'Failed to upload image' });
  }
};
