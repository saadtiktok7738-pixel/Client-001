const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Compress an image File, upload to Cloudinary via the backend, and return the CDN URL.
 * Falls back gracefully with a descriptive error if the upload endpoint fails.
 */
export async function compressImage(file, maxSize = 1200, quality = 0.85) {
  // Step 1: compress client-side to reduce upload size
  const blob = await compressToBlob(file, maxSize, quality);

  // Step 2: upload the blob to the backend, which stores it on Cloudinary
  const formData = new FormData();
  formData.append("file", blob, file.name || "image.jpg");

  const token = localStorage.getItem("token");
  if (!token) throw new Error("You must be logged in to upload images");

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    let msg = `Upload failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  if (!data.url) throw new Error("Upload succeeded but no URL returned");
  return data.url;
}

/**
 * Compress a File into a JPEG Blob, respecting maxSize and quality.
 * Internal helper — not exported.
 */
function compressToBlob(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Canvas toBlob failed"));
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert string to slug
 */
export function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}