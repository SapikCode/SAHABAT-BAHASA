import fs from "node:fs/promises";

globalThis.DOMMatrix ??= class DOMMatrix {};
globalThis.ImageData ??= class ImageData {};
globalThis.Path2D ??= class Path2D {};

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
const [pdfPath, pageNumberRaw] = process.argv.slice(2);
const pageNumber = Number(pageNumberRaw || 1);
const data = new Uint8Array(await fs.readFile(pdfPath));
const pdf = await pdfjsLib.getDocument({ data, disableWorker: true }).promise;
const page = await pdf.getPage(pageNumber);
const viewport = page.getViewport({ scale: 1 });
const content = await page.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
const glyphs = content.items
  .filter((item) => item.str?.trim())
  .map((item) => ({
    text: item.str,
    x: item.transform[4],
    y: viewport.height - item.transform[5],
    w: item.width || item.str.length * 5,
    h: Math.abs(item.transform[3]) || 10,
  }))
  .filter((g) => g.y >= 34 && g.y <= viewport.height - 34)
  .sort((a, b) => a.y - b.y || a.x - b.x);

for (const side of ["L", "R"]) {
  const split = viewport.width / 2;
  const sideGlyphs = glyphs.filter((g) => (side === "L" ? g.x < split - 8 : g.x >= split - 8));
  const lines = [];
  for (const g of sideGlyphs) {
    let line = lines.find((l) => Math.abs(l.y - g.y) <= Math.max(2.2, g.h * 0.35));
    if (!line) {
      line = { y: g.y, items: [] };
      lines.push(line);
    }
    line.items.push(g);
  }
  console.log(`--- ${side} ---`);
  for (const line of lines.sort((a, b) => a.y - b.y).slice(0, 45)) {
    const items = line.items.sort((a, b) => a.x - b.x);
    const minX = Math.min(...items.map((i) => i.x)).toFixed(1);
    const text = items.map((i) => i.text).join("").replace(/\s+/g, " ").trim();
    console.log(`${minX}\t${text}`);
  }
}
