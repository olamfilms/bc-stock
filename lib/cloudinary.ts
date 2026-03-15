const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

/**
 * Build a watermarked Cloudinary URL for public display.
 * Uses the bc-stock-watermark overlay at 35% opacity, centered.
 */
export function buildWatermarkedUrl(
  cloudinaryId: string,
  options?: { width?: number; thumbnail?: boolean }
): string {
  const width = options?.thumbnail ? 600 : (options?.width ?? 1400)
  return `https://res.cloudinary.com/${cloudName}/image/upload/l_bc-stock-watermark,g_center,o_35/w_${width},q_auto,f_auto/${cloudinaryId}`
}

/**
 * Build the original (non-watermarked) Cloudinary URL.
 * For admin use only — never expose this on public-facing pages.
 */
export function buildOriginalUrl(cloudinaryId: string): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${cloudinaryId}`
}
