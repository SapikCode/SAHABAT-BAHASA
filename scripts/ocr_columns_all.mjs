import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.resolve(".tools/node/package.json"));
const { createWorker } = require("tesseract.js");

const [columnsDir, outputDir] = process.argv.slice(2);

if (!columnsDir || !outputDir) {
  console.error("Usage: ocr_columns_all.mjs INPUT_COLUMNS_DIR OUTPUT_TEXT_DIR");
  process.exit(2);
}

await fs.mkdir(outputDir, { recursive: true });
const files = (await fs.readdir(columnsDir))
  .filter((name) => /^page-\d{3}-[LR]\.png$/.test(name))
  .sort();

const worker = await createWorker("ind+eng", 1, {
  cachePath: path.resolve(".tools/tesseract-cache"),
});
await worker.setParameters({
  tessedit_pageseg_mode: "6",
  preserve_interword_spaces: "1",
});

for (const file of files) {
  const inputPath = path.join(columnsDir, file);
  const outputPath = path.join(outputDir, file.replace(/\.png$/, ".txt"));
  const result = await worker.recognize(inputPath);
  await fs.writeFile(outputPath, result.data.text, "utf8");
  console.log(outputPath);
}

await worker.terminate();
