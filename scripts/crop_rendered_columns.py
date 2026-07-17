from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: crop_rendered_columns.py INPUT_DIR OUTPUT_DIR", file=sys.stderr)
        return 2

    input_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)

    for image_path in sorted(input_dir.glob("page-*.png")):
        image = Image.open(image_path)
        width, height = image.size
        # Crop page body, then split the two dictionary columns. Values are
        # proportional so they stay stable across DPI settings.
        top = int(height * 0.20)
        bottom = int(height * 0.90)
        left_crop = (
            int(width * 0.07),
            top,
            int(width * 0.49),
            bottom,
        )
        right_crop = (
            int(width * 0.50),
            top,
            int(width * 0.93),
            bottom,
        )
        for suffix, box in (("L", left_crop), ("R", right_crop)):
            cropped = image.crop(box)
            cropped.save(output_dir / f"{image_path.stem}-{suffix}.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
