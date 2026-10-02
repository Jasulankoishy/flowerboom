export interface BouquetInspiration {
  id: string;
  title: string;
  description: string;
  flowers: string;
  image: string;
  alt: string;
  sourceUrl: string;
  position?: string;
}

/** Pinterest photographs presented as inspiration, separate from saleable products. */
export const bouquetInspiration: BouquetInspiration[] = [
  {
    id: "pink-silk",
    title: "Розовый шёлк",
    description: "Пышные розовые пионы в нежной упаковке. Мягкие оттенки и много воздушных лепестков.",
    flowers: "Розовые пионы",
    image: "/bouquets/pink-silk.jpg",
    alt: "Большой букет розовых пионов в светлой розовой упаковке",
    sourceUrl: "https://www.pinterest.com/pin/778137641861461694/",
  },
  {
    id: "powder-morning",
    title: "Пудровое утро",
    description: "Розы, нежные цветы и зелень в пудровой гамме. Лёгкий букет с естественным настроением.",
    flowers: "Розы и нежный микс",
    image: "/bouquets/powder-morning.jpg",
    alt: "Нежный смешанный букет с розовыми розами и зеленью в пудровой упаковке",
    sourceUrl: "https://www.pinterest.com/pin/710583647450210807/",
  },
  {
    id: "blue-cloud",
    title: "Голубое облако",
    description: "Воздушная голубая гортензия и эвкалипт. Прохладные оттенки в спокойной серой упаковке.",
    flowers: "Гортензия и эвкалипт",
    image: "/bouquets/blue-cloud.jpg",
    alt: "Букет голубой гортензии с листьями эвкалипта в серой упаковке",
    sourceUrl: "https://www.pinterest.com/pin/102949541475964493/",
  },
  {
    id: "white-whisper",
    title: "Белый шёпот",
    description: "Светлые розы, мелкие белые цветы и свежая зелень. Нежность в каждом небольшом акценте.",
    flowers: "Белые розы и зелень",
    image: "/bouquets/white-whisper.jpg",
    alt: "Букет светлых роз с мелкими белыми цветами и зеленью",
    sourceUrl: "https://www.pinterest.com/pin/331225747571394791/",
  },
  {
    id: "red-velvet",
    title: "Красный бархат",
    description: "Глубокий красный цвет роз и лаконичная светлая упаковка. Выразительная классика.",
    flowers: "Красные розы",
    image: "/bouquets/red-velvet.jpg",
    alt: "Букет красных роз с зеленью в светлой бежевой упаковке",
    sourceUrl: "https://www.pinterest.com/pin/741827369910922499/",
  },
  {
    id: "spring-light",
    title: "Весенний свет",
    description: "Нежно-розовые тюльпаны и длинные зелёные листья. Свободный силуэт и ощущение весны.",
    flowers: "Розовые тюльпаны",
    image: "/bouquets/spring-light.jpg",
    alt: "Большой букет светло-розовых тюльпанов с зелёными листьями",
    sourceUrl: "https://www.pinterest.com/pin/587579082673142010/",
    position: "center 30%",
  },
];
