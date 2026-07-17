from __future__ import annotations

import csv
import sys
from pathlib import Path


HEADERS = [
    "kata_tolaki",
    "arti_indonesia",
    "kalimat_tolaki",
    "kalimat_indonesia",
]


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: combine_tolaki_batches.py OUTPUT.csv INPUT1.csv INPUT2.csv ...", file=sys.stderr)
        return 2

    output_csv = Path(sys.argv[1])
    input_csvs = [Path(arg) for arg in sys.argv[2:]]
    rows: list[dict[str, str]] = []
    seen: set[tuple[str, str, str, str]] = set()

    for input_csv in input_csvs:
        with input_csv.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            for raw in reader:
                row = {header: (raw.get(header) or "").strip() for header in HEADERS}
                if not row["kata_tolaki"] or not row["arti_indonesia"]:
                    continue
                key = tuple(row[header] for header in HEADERS)
                if key in seen:
                    continue
                seen.add(key)
                rows.append(row)

    output_csv.parent.mkdir(parents=True, exist_ok=True)
    with output_csv.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=HEADERS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {output_csv}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
