const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8080';

export const PRODUCT_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="%23f1f5f9"/><rect x="34" y="42" width="92" height="76" rx="10" fill="%23e2e8f0"/><circle cx="62" cy="66" r="10" fill="%23cbd5e1"/><path d="M42 106l24-26 18 18 14-14 20 22H42z" fill="%23cbd5e1"/></svg>';

export const resolveImageUrl = (...candidates) => {
  const raw = candidates
    .flat()
    .find((value) => typeof value === 'string' && value.trim());

  if (!raw) return PRODUCT_PLACEHOLDER;

  const value = raw.trim();
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value}`;
};
