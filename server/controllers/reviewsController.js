import prisma from '../prisma/client.js';

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  const { id } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Add review
export const addReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment, userName } = req.body;

  try {
    const review = await prisma.review.create({
      data: {
        productId: id,
        rating: Number(rating),
        comment: comment || '',
        userName: userName || 'Аноним'
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Failed to add review' });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};
