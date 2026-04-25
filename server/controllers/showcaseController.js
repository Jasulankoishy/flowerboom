import prisma from '../prisma/client.js';

const MAX_SHOWCASE_SLIDES = 5;

const includeProduct = {
  product: true
};

const orderByShowcase = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' }
];

const parseBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1' || value === 'on';
};

const parseSortOrder = (value, fallback = 0) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getPayload = (body, current = {}) => {
  const title = body.title ?? current.title;
  const description = body.description ?? current.description;
  const image = body.image ?? body.imageUrl ?? current.image;
  const productId = body.productId ?? current.productId;

  return {
    title: typeof title === 'string' ? title.trim() : title,
    description: typeof description === 'string' ? description.trim() : description,
    image: typeof image === 'string' ? image.trim() : image,
    productId: typeof productId === 'string' ? productId.trim() : productId,
    sortOrder: parseSortOrder(body.sortOrder, current.sortOrder ?? 0),
    isActive: parseBoolean(body.isActive, current.isActive ?? true)
  };
};

const validatePayload = async (payload) => {
  if (!payload.title || !payload.description || !payload.image || !payload.productId) {
    return 'Title, description, image and product are required';
  }

  const product = await prisma.product.findUnique({
    where: { id: payload.productId }
  });

  if (!product) {
    return 'Linked product not found';
  }

  return null;
};

export const getPublicShowcase = async (req, res) => {
  try {
    const slides = await prisma.showcaseSlide.findMany({
      where: {
        isActive: true,
        product: { isPublished: true }
      },
      include: includeProduct,
      orderBy: orderByShowcase
    });

    res.json(slides);
  } catch (error) {
    console.error('Get showcase error:', error);
    res.status(500).json({ message: 'Failed to fetch showcase slides' });
  }
};

export const getAdminShowcase = async (req, res) => {
  try {
    const slides = await prisma.showcaseSlide.findMany({
      include: includeProduct,
      orderBy: orderByShowcase
    });

    res.json(slides);
  } catch (error) {
    console.error('Get admin showcase error:', error);
    res.status(500).json({ message: 'Failed to fetch showcase slides' });
  }
};

export const createShowcaseSlide = async (req, res) => {
  try {
    const slidesCount = await prisma.showcaseSlide.count();
    if (slidesCount >= MAX_SHOWCASE_SLIDES) {
      return res.status(400).json({ message: `Можно добавить максимум ${MAX_SHOWCASE_SLIDES} слайдов витрины` });
    }

    const payload = getPayload(req.body, { sortOrder: slidesCount + 1, isActive: true });
    const validationError = await validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const slide = await prisma.showcaseSlide.create({
      data: payload,
      include: includeProduct
    });

    res.status(201).json(slide);
  } catch (error) {
    console.error('Create showcase error:', error);
    res.status(500).json({ message: 'Failed to create showcase slide' });
  }
};

export const updateShowcaseSlide = async (req, res) => {
  const { id } = req.params;

  try {
    const current = await prisma.showcaseSlide.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ message: 'Showcase slide not found' });
    }

    const payload = getPayload(req.body, current);
    const validationError = await validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const slide = await prisma.showcaseSlide.update({
      where: { id },
      data: payload,
      include: includeProduct
    });

    res.json(slide);
  } catch (error) {
    console.error('Update showcase error:', error);
    res.status(500).json({ message: 'Failed to update showcase slide' });
  }
};

export const deleteShowcaseSlide = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.showcaseSlide.delete({ where: { id } });
    res.json({ message: 'Showcase slide deleted successfully' });
  } catch (error) {
    console.error('Delete showcase error:', error);
    res.status(500).json({ message: 'Failed to delete showcase slide' });
  }
};
