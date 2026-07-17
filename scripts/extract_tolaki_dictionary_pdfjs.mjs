import fs from "node:fs/promises";
import path from "node:path";

class SimpleDOMMatrix {
  constructor(init) {
    if (Array.isArray(init) && init.length >= 6) {
      [this.a, this.b, this.c, this.d, this.e, this.f] = init;
    } else {
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 1;
      this.e = 0;
      this.f = 0;
    }
  }
  multiply(other) {
    return new SimpleDOMMatrix([
      this.a * other.a + this.c * other.b,
      this.b * other.a + this.d * other.b,
      this.a * other.c + this.c * other.d,
      this.b * other.c + this.d * other.d,
      this.a * other.e + this.c * other.f + this.e,
      this.b * other.e + this.d * other.f + this.f,
    ]);
  }
  translate(x = 0, y = 0) {
    return this.multiply(new SimpleDOMMatrix([1, 0, 0, 1, x, y]));
  }
  scale(x = 1, y = x) {
    return this.multiply(new SimpleDOMMatrix([x, 0, 0, y, 0, 0]));
  }
}

globalThis.DOMMatrix ??= SimpleDOMMatrix;
globalThis.ImageData ??= class ImageData {};
globalThis.Path2D ??= class Path2D {};

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

const [pdfPath, csvPath] = process.argv.slice(2);

if (!pdfPath || !csvPath) {
  console.error("Usage: extract_tolaki_dictionary_pdfjs.mjs INPUT.pdf OUTPUT.csv");
  process.exit(2);
}

const headers = ["kata_tolaki", "arti_indonesia", "kalimat_tolaki", "kalimat_indonesia"];
const softHyphen = "\u00ad";
const joinMarker = "\u00ac";
const termToken = String.raw`[A-Za-z][A-Za-z'./-]*`;
const entryRe = new RegExp(
  String.raw`^(?<num>\d*)(?<word>${termToken}(?:\s*,\s*(?:${termToken}\s+)?${termToken}){0,3})\s+(?<rest>.+)$`,
);

function entryInitial(line) {
  const match = entryRe.exec(line);
  if (!match?.groups) return "";
  return match.groups.word.replace(/^\d+/, "").trim()[0]?.toLowerCase() || "";
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function cleanLine(line) {
  return line
    .replaceAll(softHyphen, joinMarker)
    .replaceAll("~", "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+([,;:.])/g, "$1")
    .replace(/([({])\s+/g, "$1")
    .replace(/\s+([)}])/g, "$1");
}

function mergeHyphenated(text) {
  return text
    .replace(new RegExp(`${joinMarker}\\s+`, "g"), "")
    .replaceAll(joinMarker, "")
    .replace(/([A-Za-z])-\s+([a-z])/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikePageNoise(line) {
  if (!line) return true;
  if (/^[A-Z]$/.test(line)) return true;
  if (/^\d{1,3}$/.test(line)) return true;
  if (!/[:;,]/.test(line) && line.split(/\s+/).length <= 3) return true;
  return false;
}

function isEntryStart(line) {
  if (looksLikePageNoise(line)) return false;
  if (!/[:;]/.test(line.slice(0, 95))) return false;
  const match = entryRe.exec(line);
  if (!match?.groups) return false;
  const rest = match.groups.rest;
  const positions = [rest.indexOf(":"), rest.indexOf(";")].filter((pos) => pos >= 0);
  if (!positions.length) return false;
  const gloss = rest.slice(0, Math.min(...positions)).trim();
  if (!gloss || gloss.length > 72) return false;
  const firstWord = match.groups.word.split(",")[0].toLowerCase();
  if (["di", "dan", "dari", "ke", "kalau", "ketika", "supaya"].includes(firstWord)) return false;
  return true;
}

function splitEntry(entry) {
  const normalized = mergeHyphenated(entry);
  const match = entryRe.exec(normalized);
  if (!match?.groups) return null;
  let word = match.groups.word.replace(/^\d+/, "").trim().replace(/,\s+/g, ", ");
  const rest = match.groups.rest.trim();
  const delimiter = rest.search(/[:;]/);
  if (delimiter < 0) return null;
  const gloss = rest.slice(0, delimiter).trim().replace(/\s+/g, " ");
  let usage = rest.slice(delimiter + 1).trim().replace(/\s+/g, " ");
  if (!word || !gloss) return null;
  usage = usage.split(";")[0].trim();
  let kalimatTolaki = "";
  let kalimatIndonesia = "";
  const comma = usage.indexOf(",");
  if (comma >= 0) {
    kalimatTolaki = usage.slice(0, comma).trim();
    kalimatIndonesia = usage.slice(comma + 1).trim();
  } else {
    kalimatTolaki = usage;
  }
  return {
    kata_tolaki: word,
    arti_indonesia: gloss,
    kalimat_tolaki: kalimatTolaki,
    kalimat_indonesia: kalimatIndonesia,
  };
}

function glyphsToLines(glyphs) {
  const lines = [];
  for (const glyph of glyphs) {
    let line = lines.find((candidate) => Math.abs(candidate.y - glyph.y) <= Math.max(2.2, glyph.h * 0.35));
    if (!line) {
      line = { y: glyph.y, items: [] };
      lines.push(line);
    }
    line.items.push(glyph);
    line.y = (line.y * (line.items.length - 1) + glyph.y) / line.items.length;
  }

  return lines
    .sort((a, b) => a.y - b.y)
    .map((line) => {
      const sorted = line.items.sort((a, b) => a.x - b.x);
      let text = "";
      let previousEnd = null;
      for (const item of sorted) {
        if (previousEnd !== null) {
          const gap = item.x - previousEnd;
          if (gap > 1.3) text += " ";
        }
        text += item.text;
        previousEnd = item.x + item.w;
      }
      return {
        text: cleanLine(text),
        x: Math.min(...sorted.map((item) => item.x)),
      };
    })
    .filter((line) => line.text);
}

function textItemsToLines(items, viewport) {
  const glyphs = items
    .filter((item) => item.str?.trim())
    .map((item) => ({
      text: item.str,
      x: item.transform[4],
      y: viewport.height - item.transform[5],
      w: item.width || item.str.length * 5,
      h: Math.abs(item.transform[3]) || 10,
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const contentGlyphs = glyphs.filter((glyph) => {
    if (glyph.y < 34 || glyph.y > viewport.height - 34) return false;
    return true;
  });
  const splitX = viewport.width / 2;
  const left = contentGlyphs.filter((glyph) => glyph.x < splitX - 8);
  const right = contentGlyphs.filter((glyph) => glyph.x >= splitX - 8);
  const columns = [glyphsToLines(left), glyphsToLines(right)];
  const normalized = [];
  for (const column of columns) {
    if (!column.length) continue;
    const marginX = Math.min(...column.map((line) => line.x));
    for (let index = 0; index < column.length; index += 1) {
      const line = column[index];
      if (/^\d+[A-Za-z]*$/.test(line.text) && column[index + 1]) {
        const next = column[index + 1];
        normalized.push({
          text: `${line.text} ${next.text}`,
        isEntryIndent: true,
        });
        index += 1;
        continue;
      }
      normalized.push({
        text: line.text,
        isEntryIndent: line.x <= marginX + 14,
      });
    }
  }
  return normalized.filter((line) => !looksLikePageNoise(line.text));
}

const data = new Uint8Array(await fs.readFile(pdfPath));
const pdf = await pdfjsLib.getDocument({ data, disableWorker: true }).promise;
const pageLines = [];

for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
  pageLines.push(textItemsToLines(content.items, viewport));
}

const allowedInitialsByPage = pageLines.map((lines) => {
  const counts = new Map();
  for (const line of lines) {
    if (!line.isEntryIndent || !isEntryStart(line.text)) continue;
    const initial = entryInitial(line.text);
    if (!initial) continue;
    counts.set(initial, (counts.get(initial) || 0) + 1);
  }
  if (!counts.size) return new Set();
  const maxCount = Math.max(...counts.values());
  const allowed = new Set(
    [...counts.entries()]
      .filter(([, count]) => count >= 2 && count >= maxCount * 0.25)
      .map(([initial]) => initial),
  );
  if (!allowed.size) {
    allowed.add([...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]);
  }
  return allowed;
});

const entries = [];
let current = [];
for (let pageIndex = 0; pageIndex < pageLines.length; pageIndex += 1) {
  const lines = pageLines[pageIndex];
  const allowedInitials = allowedInitialsByPage[pageIndex];
  for (const line of lines) {
    const initial = entryInitial(line.text);
    if (
      line.isEntryIndent &&
      isEntryStart(line.text) &&
      (!allowedInitials.size || allowedInitials.has(initial))
    ) {
      if (current.length) entries.push(current.join(" "));
      current = [line.text];
    } else if (current.length) {
      current.push(line.text);
    }
  }
}
if (current.length) entries.push(current.join(" "));

const rows = [];
const seen = new Set();
for (const entry of entries) {
  const row = splitEntry(entry);
  if (!row) continue;
  const key = headers.map((header) => row[header]).join("\u0001");
  if (seen.has(key)) continue;
  seen.add(key);
  rows.push(row);
}

await fs.mkdir(path.dirname(csvPath), { recursive: true });
const csv = [
  headers.join(","),
  ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
].join("\n");
await fs.writeFile(csvPath, csv, "utf8");
console.log(`Wrote ${rows.length} rows to ${csvPath}`);
