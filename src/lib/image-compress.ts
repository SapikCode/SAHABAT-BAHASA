/**
 * Compress an image file in the browser: resize to a max dimension and
 * re-encode as WebP, stepping quality down until the result is close to
 * the target size (or the minimum quality floor is reached).
 */
export async function compressImageToWebp(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    targetKB?: number;
    minQuality?: number;
    initialQuality?: number;
  },
): Promise<File> {
  const maxWidth = options?.maxWidth ?? 1600;
  const maxHeight = options?.maxHeight ?? 1600;
  const targetKB = options?.targetKB ?? 100;
  const minQuality = options?.minQuality ?? 0.4;
  const initialQuality = options?.initialQuality ?? 0.82;

  const bitmap = await loadImageBitmap(file);

  let { width, height } = bitmap;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas tidak didukung di browser ini.");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);

  const targetBytes = targetKB * 1024;
  let quality = initialQuality;
  let blob = await canvasToWebpBlob(canvas, quality);

  while (blob.size > targetBytes && quality > minQuality) {
    quality = Math.max(minQuality, quality - 0.1);
    blob = await canvasToWebpBlob(canvas, quality);
  }

  const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";

  return new File([blob], newName, { type: "image/webp" });
}

function loadImageBitmap(file: File): Promise<ImageBitmap> {
  if ("createImageBitmap" in window) {
    return window.createImageBitmap(file);
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img as unknown as ImageBitmap);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal membaca gambar."));
    };
    img.src = url;
  });
}

function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Gagal mengonversi gambar ke WebP."));
        }
      },
      "image/webp",
      quality,
    );
  });
}
