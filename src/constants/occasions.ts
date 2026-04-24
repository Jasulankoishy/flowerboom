export const OCCASIONS = [
  { slug: "birthday", label: "День рождения" },
  { slug: "surprise", label: "Сюрприз-букеты" },
  { slug: "love", label: "Любовь / отношения" },
  { slug: "holidays", label: "Праздники" },
  { slug: "just-because", label: "Просто так" },
  { slug: "apology", label: "Извинения" },
  { slug: "wedding", label: "Свадьба" },
] as const;

export type OccasionSlug = (typeof OCCASIONS)[number]["slug"];

export const getOccasionLabel = (slug: string) => {
  return OCCASIONS.find((occasion) => occasion.slug === slug)?.label || slug;
};
