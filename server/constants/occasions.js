export const OCCASIONS = [
  { slug: 'birthday', label: 'День рождения' },
  { slug: 'surprise', label: 'Сюрприз-букеты' },
  { slug: 'love', label: 'Любовь / отношения' },
  { slug: 'holidays', label: 'Праздники' },
  { slug: 'just-because', label: 'Просто так' },
  { slug: 'apology', label: 'Извинения' },
  { slug: 'wedding', label: 'Свадьба' }
];

const allowedOccasions = new Set(OCCASIONS.map((occasion) => occasion.slug));

export const normalizeOccasions = (value) => {
  let raw = value;

  if (!raw) return [];

  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = raw.split(',');
    }
  }

  if (!Array.isArray(raw)) return [];

  return [...new Set(raw.map((item) => String(item).trim()).filter((item) => allowedOccasions.has(item)))];
};
