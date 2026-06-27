// Canvas-based image utilities.
// - resizeImageToFit: scales an image down so its longest edge <= maxEdge,
//   preserving aspect ratio. Returns a base64 data URL (PNG/JPEG).
// - fileToInlineBase64Part: returns the parts needed for a Gemini
//   inlineData multimodal request ({ inlineData: { data, mimeType } }).

const MAX_EDGE = 1280
const JPEG_QUALITY = 0.82

export interface InlineImagePart {
  inlineData: { data: string; mimeType: string }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })
}

/**
 * Resize an image file so its longest edge <= maxEdge. Returns a JPEG/PNG
 * base64 data URL. No-op (returns original data URL) when already small.
 */
export async function resizeImageToFit(
  file: File,
  maxEdge = MAX_EDGE,
): Promise<{ dataUrl: string; width: number; height: number; bytes: number }> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    const longest = Math.max(img.width, img.height)
    const scale = longest > maxEdge ? maxEdge / longest : 1
    const width = Math.round(img.width * scale)
    const height = Math.round(img.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas 2D context unavailable")
    ctx.drawImage(img, 0, 0, width, height)

    // Prefer JPEG for photos to keep payload small; fall back to PNG for
    // transparency (PNG inputs).
    const isPng = file.type === "image/png"
    const mimeType = isPng ? "image/png" : "image/jpeg"
    const dataUrl = isPng
      ? canvas.toDataURL(mimeType)
      : canvas.toDataURL(mimeType, JPEG_QUALITY)

    const bytes = Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75)
    return { dataUrl, width, height, bytes }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/** Convert a base64 data URL to a Gemini inlineData part. */
export function dataUrlToInlinePart(dataUrl: string): InlineImagePart {
  const [meta, data] = dataUrl.split(",")
  const mimeType = /data:([^;]+);base64/.exec(meta)?.[1] ?? "image/jpeg"
  return { inlineData: { data, mimeType } }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
