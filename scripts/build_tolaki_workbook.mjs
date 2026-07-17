import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const [csvPath, xlsxPath, sheetName = "kamus_tolaki_batch1"] = process.argv.slice(2);

if (!csvPath || !xlsxPath) {
  console.error("Usage: build_tolaki_workbook.mjs INPUT.csv OUTPUT.xlsx [SHEET_NAME]");
  process.exit(2);
}

const csvText = await fs.readFile(csvPath, "utf8");
const workbook = await Workbook.fromCSV(csvText, {
  sheetName,
});

const preview = await workbook.inspect({
  kind: "table",
  range: `${sheetName}!A1:D12`,
  include: "values",
  tableMaxRows: 12,
  tableMaxCols: 4,
});
console.log(preview.ndjson);

await fs.mkdir(xlsxPath.replace(/[\\/][^\\/]+$/, ""), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(xlsxPath);
console.log(`Saved ${xlsxPath}`);
