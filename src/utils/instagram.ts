const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/";

export const getInstagramUrl = () => {
  return String(import.meta.env.VITE_INSTAGRAM_URL || DEFAULT_INSTAGRAM_URL);
};
