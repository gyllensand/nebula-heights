export const COLORS = [
  "#dc202e",
  "#2d338b",
  "#ea8c2d",
  "#c06e86",
  "#0f9ebe",
  "#1c6ff1",
  "#57a6ff",
  "#eb3434",
  "#cb4e4d",
  "#ff48e6",
  "#bd22a8",
  "#249582",
  "#005c1b",
  "#010101",
];

export const LIGHT_COLORS = [...COLORS, "#ffffff", "#30f8a0", "#ffce00"];

export const DARK_COLORS = [...COLORS, "#000000"];

export const GRAIN_COLORS = [
  ...new Array(10).fill(null).map(() => "#010101"),
  "#160001",
  "#00021c",
  "#000042",
  "#150b00",
  "#000201",
];

export const EDGE_COLORS = [
  ...new Array(50).fill(null).map(() => "#ffffff"),
  ...LIGHT_COLORS,
];

export const POINT_COLORS = [
  "#ff48e6",
  "#ffce00",
  "#ea8c2d",
  "#fff6d1",
  "#57a6ff",
  "#dc202e",
];

export enum Theme {
  Dark = "dark",
  Light = "light",
}

export enum ColorMode {
  Plain = 0,
  PlainDiff = 1,
  EveryOther = 2,
}
