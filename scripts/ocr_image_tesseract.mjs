import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.resolve(".tools/node/package.json"));
const { createWorker } = require("tesseract.js");

const [imagePath, outputPath] = process.argv.slice(2);

if (!imagePath || !outputPath) {
  console.error("Usage: ocr_image_tesseract.mjs INPUT.png OUTPUT.txt");
  process.exit(2);
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const worker = await createWorker("ind+eng", 1, {
  cachePath: path.resolve(".tools/tesseract-cache"),
});

await worker.setParameters({
  tessedit_pageseg_mode: "6",
  preserve_interword_spaces: "1",
});

const result = await worker.recognize(imagePath);
await fs.writeFile(outputPath, result.data.text, "utf8");
await worker.terminate();
console.log(`Saved ${outputPath}`);
