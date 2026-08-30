export function canvasFontFamily(font?: string) {
  if (font === "cinzel") return '"Cinzel", Georgia, serif';
  if (font === "dancing") return '"Dancing Script", cursive';
  if (font === "caveat") return '"Caveat", cursive';
  if (font === "montserrat") return '"Montserrat", Arial, sans-serif';
  if (font === "serif") return "Georgia, serif";
  return "Inter, Arial, sans-serif";
}

export function fontClassName(font?: string) {
  if (font === "cinzel") return "font-cinzel";
  if (font === "dancing") return "font-dancing";
  if (font === "caveat") return "font-caveat";
  if (font === "montserrat") return "font-montserrat";
  if (font === "serif") return "font-serif";
  return "font-sans";
}
