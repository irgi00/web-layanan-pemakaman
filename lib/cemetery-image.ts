export const DEFAULT_CEMETERY_IMAGE = '/images/cemetery-placeholder.jpg';

export function getCemeteryImageUrl(imageUrl?: string | null) {
  const trimmedImageUrl = imageUrl?.trim();

  if (!trimmedImageUrl) {
    return DEFAULT_CEMETERY_IMAGE;
  }

  return trimmedImageUrl;
}

export function isSupportedCemeteryImageUrl(imageUrl?: string | null) {
  const trimmedImageUrl = imageUrl?.trim();

  if (!trimmedImageUrl) {
    return false;
  }

  return /^https?:\/\//i.test(trimmedImageUrl) || trimmedImageUrl.startsWith('/');
}
