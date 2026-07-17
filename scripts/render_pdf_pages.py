from __future__ import annotations

import sys
from pathlib import Path

import pypdfium2 as pdfium


def main() -> int:
    if len(sys.argv) < 5:
        print("Usage: render_pdf_pages.py INPUT.pdf OUTPUT_DIR FIRST_PAGE LAST_PAGE", file=sys.stderr)
        return 2

    pdf_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    first_page = int(sys.argv[3])
    last_page = int(sys.argv[4])
    output_dir.mkdir(parents=True, exist_ok=True)

    pdf = pdfium.PdfDocument(str(pdf_path))
    for page_number in range(first_page, last_page + 1):
        page = pdf[page_number - 1]
        bitmap = page.render(scale=3.2, rotation=0)
        image = bitmap.to_pil()
        output_path = output_dir / f"page-{page_number:03d}.png"
        image.save(output_path)
        print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
