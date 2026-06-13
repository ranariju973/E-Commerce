/**
 * Cloudinary image optimization helper.
 * Applies dynamic transformations to Cloudinary URLs for optimal delivery.
 */

const CLOUDINARY_UPLOAD_PATTERN = '/upload/'

/**
 * Returns an optimized Cloudinary URL with c_fill, dimensions, q_auto, f_auto.
 * If the URL is not a Cloudinary URL, returns it as-is.
 */
export const getOptimizedImageUrl = (url, width = 400, height = 400) => {
  if (!url || typeof url !== 'string') return ''

  // Only transform Cloudinary URLs
  if (!url.includes(CLOUDINARY_UPLOAD_PATTERN)) return url

  const transformation = `c_fit,w_${width},h_${height},q_auto,f_auto`
  return url.replace(CLOUDINARY_UPLOAD_PATTERN, `${CLOUDINARY_UPLOAD_PATTERN}${transformation}/`)
}

// Preset sizes for common use cases
export const ImageSize = {
  CARD: { width: 400, height: 400 },
  DETAIL: { width: 800, height: 800 },
  THUMBNAIL: { width: 200, height: 200 },
  CART: { width: 80, height: 80 },
  CART_MD: { width: 160, height: 160 },
  BANNER: { width: 1200, height: 500 },
  REVIEW: { width: 300, height: 300 },
}

/**
 * Shorthand helpers for common sizes.
 */
export const getCardImage = (url) => getOptimizedImageUrl(url, ImageSize.CARD.width, ImageSize.CARD.height)
export const getDetailImage = (url) => getOptimizedImageUrl(url, ImageSize.DETAIL.width, ImageSize.DETAIL.height)
export const getThumbnailImage = (url) => getOptimizedImageUrl(url, ImageSize.THUMBNAIL.width, ImageSize.THUMBNAIL.height)
export const getCartImage = (url) => getOptimizedImageUrl(url, ImageSize.CART.width, ImageSize.CART.height)
