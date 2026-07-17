import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const [pdfPath, outputPath] = process.argv.slice(2);

if (!pdfPath || !outputPath) {
  console.error("Usage: render_pdf_page.mjs INPUT.pdf OUTPUT.png");
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1900 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(path.resolve(pdfPath)).href, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Saved ${outputPath}`);
