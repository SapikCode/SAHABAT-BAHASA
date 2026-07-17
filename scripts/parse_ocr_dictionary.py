from __future__ import annotations

import csv
import re
import sys
from pathlib import Path


HEADERS = [
    "kata_tolaki",
    "arti_indonesia",
    "kalimat_tolaki",
    "kalimat_indonesia",
]

TERM_TOKEN = r"[A-Za-z][A-Za-z'./-]*"
ENTRY_RE = re.compile(
    rf"^(?P<word>{TERM_TOKEN}(?:\s*,\s*(?:{TERM_TOKEN}\s+)?{TERM_TOKEN}){{0,3}})\s+"
    r"(?P<gloss>[^:]{1,80})\s*:\s*(?P<usage>.+)$"
)


def normalize_text(text: str) -> str:
    replacements = {
        "\u2014": "-",
        "\u2013": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u00a0": " ",
        "\u00a9": "",
        "~": "-",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    text = re.sub(r"[ \t]+", " ", text)
    return text


def normalize_line(line: str) -> str:
    line = normalize_text(line).strip()
    line = re.sub(r"\s+([,;:.])", r"\1", line)
    line = re.sub(r"([({])\s+", r"\1", line)
    line = re.sub(r"\s+([)}])", r"\1", line)
    # Common OCR confusion for footnote-like sense numbers at the start.
    line = re.sub(r"^l(?=aa\b|aha\b)", "1", line)
    line = re.sub(r"^l(?=ai\b)", "1", line)
    line = re.sub(r"^l(?=koa\b)", "1", line)
    line = re.sub(r"^Z(?=aha\b)", "2", line)
    return line


def merge_block_lines(lines: list[str]) -> str:
    merged = ""
    for raw in lines:
        line = normalize_line(raw)
        if not line:
            continue
        if not merged:
            merged = line
            continue
        if merged.endswith("-") and re.match(r"^[a-z]", line):
            merged = merged[:-1] + line
        else:
            merged += " " + line
    merged = re.sub(r"\s+", " ", merged).strip()
    return merged


def split_blocks(text: str) -> list[list[str]]:
    blocks: list[list[str]] = []
    current: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            if current:
                blocks.append(current)
                current = []
            continue
        if re.fullmatch(r"[A-Z]|\d{1,3}", line):
            continue
        current.append(line)
    if current:
        blocks.append(current)
    return blocks


def clean_word(word: str) -> str:
    word = re.sub(r"^[0-9]+", "", word).strip(" ,")
    word = re.sub(r"\s*,\s*", ", ", word)
    corrections = {
        "aghuano": "aahuano",
        "loa": "koa",
    }
    word = corrections.get(word, word)
    word = re.sub(r"\bc(?=[aou])", "k", word)
    word = re.sub(r"^l(?=k)", "", word)
    return word


def parse_entry(block: str) -> dict[str, str] | None:
    block = normalize_line(block)
    block = re.sub(r"^[0-9]+\s*", "", block)
    match = ENTRY_RE.match(block)
    if not match:
        return None

    word = clean_word(match.group("word"))
    gloss = match.group("gloss").strip(" ,;:")
    usage = match.group("usage").strip(" ;")
    if not re.fullmatch(r"[a-z][a-z'./-]*(?:,\s*(?:[a-z][a-z'./-]*\s+)?[a-z][a-z'./-]*){0,3}", word):
        return None
    if not word or not gloss:
        return None
    if gloss.startswith("-") or len(gloss) > 55:
        return None
    if word == "a" and gloss.lower() in {"kamu", "supaya anda"}:
        word = "ai"
    if re.search(r"[A-Z]{3,}|\d", gloss):
        return None
    if len(word) == 1 and word not in {"a"}:
        return None
    if word in {"a", "si", "zi", "sekali"} and gloss:
        return None
    if "-" in word and len(word) <= 2:
        return None
    if word.endswith("nya"):
        return None
    if re.search(r"\s(saya|dia|mereka|kami|kamu|orang|jeratnya)\b", word):
        return None
    joined_for_noise = " ".join([word, gloss, usage])
    if re.search(r"\d|[&|]|[A-Z]{3,}", joined_for_noise):
        return None
    if ":" in usage:
        return None

    kalimat_tolaki = ""
    kalimat_indonesia = ""
    comma = usage.find(",")
    if comma >= 0:
        kalimat_tolaki = usage[:comma].strip(" ;")
        kalimat_indonesia = usage[comma + 1 :].strip(" ;")
    else:
        kalimat_tolaki = usage.strip(" ;")

    return {
        "kata_tolaki": word,
        "arti_indonesia": gloss,
        "kalimat_tolaki": kalimat_tolaki,
        "kalimat_indonesia": kalimat_indonesia,
    }


def split_merged_entries(block: str) -> list[str]:
    pattern = re.compile(
        rf"(?<=[.;?])\s+(?=(?:[0-9lZ]{{0,2}})?{TERM_TOKEN}(?:\s*,\s*(?:{TERM_TOKEN}\s+)?{TERM_TOKEN}){{0,3}}\s+[^:;]{{1,55}}\s*:)"
    )
    return [part.strip(" .,;") for part in pattern.split(block) if part.strip(" .,;")]


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: parse_ocr_dictionary.py OCR_DIR OUTPUT.csv", file=sys.stderr)
        return 2

    ocr_dir = Path(sys.argv[1])
    output_csv = Path(sys.argv[2])
    rows: list[dict[str, str]] = []
    seen: set[tuple[str, str, str, str]] = set()

    for text_path in sorted(ocr_dir.glob("page-*-*.txt")):
        text = text_path.read_text(encoding="utf-8", errors="replace")
        for block_lines in split_blocks(text):
            block = merge_block_lines(block_lines)
            for part in split_merged_entries(block):
                row = parse_entry(part)
                if not row:
                    continue
                key = tuple(row[header] for header in HEADERS)
                if key in seen:
                    continue
                seen.add(key)
                rows.append(row)

    output_csv.parent.mkdir(parents=True, exist_ok=True)
    with output_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=HEADERS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {output_csv}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
