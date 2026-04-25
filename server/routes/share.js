import express from 'express';
import prisma from '../prisma/client.js';

const router = express.Router();

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const trimDescription = (value) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
};

const getPublicSiteUrl = () => {
  return (process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
};

const getPublicApiUrl = () => {
  return (process.env.PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3003').replace(/\/$/, '');
};

const getProductKey = (product) => product.slug || product.id;

const renderProductShareHtml = ({ product, shareUrl, productUrl }) => {
  const title = `${product.title} — Flowerboom`;
  const description = trimDescription(`${product.description} ${product.price ? `Цена: ${product.price}` : ''}`);
  const image = product.image || `${getPublicSiteUrl()}/og-image.svg`;

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="Flowerboom" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:url" content="${escapeHtml(shareUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <link rel="canonical" href="${escapeHtml(productUrl)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(productUrl)}" />
  </head>
  <body>
    <main style="font-family: Arial, sans-serif; padding: 32px;">
      <h1>${escapeHtml(product.title)}</h1>
      <p>${escapeHtml(description)}</p>
      <p><a href="${escapeHtml(productUrl)}">Открыть букет</a></p>
    </main>
  </body>
</html>`;
};

const renderNotFoundHtml = () => `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Товар не найден — Flowerboom</title>
    <meta name="robots" content="noindex" />
  </head>
  <body>
    <main style="font-family: Arial, sans-serif; padding: 32px;">
      <h1>Товар не найден</h1>
      <p>Возможно, ссылка устарела или букет удалён.</p>
      <p><a href="${escapeHtml(getPublicSiteUrl())}">Вернуться на Flowerboom</a></p>
    </main>
  </body>
</html>`;

router.get('/product/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug }
    });

    if (!product) {
      res.status(404).type('html').send(renderNotFoundHtml());
      return;
    }

    const productKey = getProductKey(product);
    const shareUrl = `${getPublicApiUrl()}/share/product/${encodeURIComponent(productKey)}`;
    const productUrl = `${getPublicSiteUrl()}/product/${encodeURIComponent(productKey)}`;

    res
      .status(200)
      .type('html')
      .set('Cache-Control', 'public, max-age=300')
      .send(renderProductShareHtml({ product, shareUrl, productUrl }));
  } catch (error) {
    console.error('Share product error:', error);
    res.status(500).type('html').send(renderNotFoundHtml());
  }
});

export default router;
