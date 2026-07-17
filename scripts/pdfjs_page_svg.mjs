import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

class NodeCanvasFactory {
  create() {
    throw new Error("Canvas rendering is not available in this environment.");
  }
  reset() {}
  destroy() {}
}

const [pdfPath, pageNumberRaw, outputPath] = process.argv.slice(2);

if (!pdfPath || !pageNumberRaw || !outputPath) {
  console.error("Usage: pdfjs_page_svg.mjs INPUT.pdf PAGE_NUMBER OUTPUT.svg");
  process.exit(2);
}

const pageNumber = Number(pageNumberRaw);
const data = new Uint8Array(await fs.readFile(pdfPath));
const loadingTask = pdfjsLib.getDocument({
  data,
  standardFontDataUrl: path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "node_modules",
    "pdfjs-dist",
    "standard_fonts",
  ) + path.sep,
  disableWorker: true,
});

const pdf = await loadingTask.promise;
const page = await pdf.getPage(pageNumber);
const viewport = page.getViewport({ scale: 2 });
const operatorList = await page.getOperatorList();
const svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs, new NodeCanvasFactory());
const svg = await svgGfx.getSVG(operatorList, viewport);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, svg.toString(), "utf8");
console.log(`Saved ${outputPath}`);
