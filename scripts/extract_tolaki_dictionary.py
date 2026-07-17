from __future__ import annotations

import csv
from collections import Counter
import re
import sys
from pathlib import Path

import pypdf


SOFT_HYPHEN = "\u00ad"
JOIN_MARKER = "\u00ac"


def clean_line(line: str) -> str:
    line = line.replace(SOFT_HYPHEN, JOIN_MARKER)
    line = line.replace("~", "-")
    line = re.sub(r"\s+", " ", line).strip()
    line = re.sub(r"\s+([,;:.])", r"\1", line)
    line = re.sub(r"([({])\s+", r"\1", line)
    line = re.sub(r"\s+([)}])", r"\1", line)
    return line


def looks_like_page_noise(line: str) -> bool:
    if not line:
        return True
    if re.fullmatch(r"[A-Z]", line):
        return True
    if re.fullmatch(r"\d{1,3}", line):
        return True
    # Page running heads are usually one to three bare words without gloss/example punctuation.
    if not re.search(r"[:;,]", line) and len(line.split()) <= 3:
        return True
    return False


TERM_TOKEN = r"[A-Za-z][A-Za-z'./-]*"
ENTRY_RE = re.compile(
    r"^(?P<num>\d*)"
    rf"(?P<word>{TERM_TOKEN}(?:\s*,\s*(?:{TERM_TOKEN}\s+)?{TERM_TOKEN}){{0,3}})"
    r"\s+(?P<rest>.+)$"
)


def is_entry_start(line: str) -> bool:
    if looks_like_page_noise(line):
        return False
    if not re.search(r"[:;]", line[:95]):
        return False
    match = ENTRY_RE.match(line)
    if not match:
        return False
    rest = match.group("rest")
    delimiter_positions = [pos for pos in (rest.find(":"), rest.find(";")) if pos >= 0]
    if not delimiter_positions:
        return False
    gloss = rest[: min(delimiter_positions)].strip()
    if not gloss or len(gloss) > 72:
        return False
    # Continuation/example lines often start with particles such as "di", "dan", "dari".
    first_word = match.group("word").split(",")[0].lower()
    if first_word in {"di", "dan", "dari", "ke", "kalau", "ketika", "supaya"}:
        return False
    return True


def merge_hyphenated(text: str) -> str:
    # Repair OCR/extraction line-break hyphenation inside Indonesian words.
    text = re.sub(rf"{JOIN_MARKER}\s+", "", text)
    text = text.replace(JOIN_MARKER, "")
    text = re.sub(r"([A-Za-z])-\s+([a-z])", r"\1\2", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def split_entry(entry: str) -> dict[str, str] | None:
    entry = merge_hyphenated(entry)
    match = ENTRY_RE.match(entry)
    if not match:
        return None

    word = match.group("word").strip(" ,")
    # Drop sense numbers such as 1aa, 2aa, while keeping a separate row per sense.
    word = re.sub(r"^\d+", "", word).strip()
    rest = match.group("rest").strip()

    delimiter_match = re.search(r"[:;]", rest)
    if not delimiter_match:
        return None

    gloss = rest[: delimiter_match.start()].strip(" ,;:")
    usage = rest[delimiter_match.end() :].strip(" ;")
    if not word or not gloss:
        return None

    kalimat_tolaki = ""
    kalimat_indonesia = ""
    if usage:
        usage = usage.split(";")[0].strip()
        comma_pos = usage.find(",")
        if comma_pos >= 0:
            kalimat_tolaki = usage[:comma_pos].strip(" ;")
            kalimat_indonesia = usage[comma_pos + 1 :].strip(" ;")
        else:
            kalimat_tolaki = usage.strip(" ;")

    return {
        "kata_tolaki": word,
        "arti_indonesia": gloss,
        "kalimat_tolaki": kalimat_tolaki,
        "kalimat_indonesia": kalimat_indonesia,
    }


def extract_entries(pdf_path: Path) -> list[dict[str, str]]:
    reader = pypdf.PdfReader(str(pdf_path))
    page_lines: list[list[str]] = []
    page_initials: list[set[str]] = []

    for page in reader.pages:
        lines: list[str] = []
        text = page.extract_text() or ""
        for raw_line in text.splitlines():
            line = clean_line(raw_line)
            if not looks_like_page_noise(line):
                lines.append(line)
        page_lines.append(lines)

        counts: Counter[str] = Counter()
        for line in lines:
            if is_entry_start(line):
                candidate = ENTRY_RE.match(line)
                if candidate:
                    initial = re.sub(r"^\d+", "", candidate.group("word")).strip()[0].lower()
                    counts[initial] += 1
        if counts:
            max_count = max(counts.values())
            allowed = {
                initial
                for initial, count in counts.items()
                if count >= 2 and count >= max_count * 0.25
            }
            if not allowed:
                allowed = {counts.most_common(1)[0][0]}
        else:
            allowed = set()
        page_initials.append(allowed)

    entries: list[str] = []
    current: list[str] = []
    for page_index, lines in enumerate(page_lines):
        allowed_initials = page_initials[page_index]
        for line in lines:
            starts_entry = is_entry_start(line)
            if starts_entry and allowed_initials:
                candidate = ENTRY_RE.match(line)
                assert candidate is not None
                initial = re.sub(r"^\d+", "", candidate.group("word")).strip()[0].lower()
                starts_entry = initial in allowed_initials

            if starts_entry:
                if current:
                    entries.append(" ".join(current))
                current = [line]
            elif current:
                current.append(line)
    if current:
        entries.append(" ".join(current))

    rows: list[dict[str, str]] = []
    seen: set[tuple[str, str, str, str]] = set()
    for entry in entries:
        row = split_entry(entry)
        if not row:
            continue
        key = tuple(row.values())
        if key not in seen:
            seen.add(key)
            rows.append(row)
    return rows


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: extract_tolaki_dictionary.py INPUT.pdf OUTPUT.csv", file=sys.stderr)
        return 2

    pdf_path = Path(sys.argv[1])
    csv_path = Path(sys.argv[2])
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    rows = extract_entries(pdf_path)

    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "kata_tolaki",
                "arti_indonesia",
                "kalimat_tolaki",
                "kalimat_indonesia",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {csv_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
