export const COLOR_OPTIONS = [
  { value: 'white', label: 'Trắng', swatch: '#ffffff' },
  { value: 'beige', label: 'Be', swatch: '#f5f5dc' },
  { value: 'yellow', label: 'Vàng', swatch: '#facc15' },
  { value: 'orange', label: 'Cam', swatch: '#f97316' },
  { value: 'red', label: 'Đỏ', swatch: '#ef4444' },
  { value: 'pink', label: 'Hồng', swatch: '#ec4899' },
  { value: 'purple', label: 'Tím', swatch: '#8b5cf6' },
  { value: 'teal', label: 'Xanh teal', swatch: '#14b8a6' },
  { value: 'cyan', label: 'Xanh cyan', swatch: '#06b6d4' },
  { value: 'green', label: 'Xanh lá', swatch: '#22c55e' },
  { value: 'blue', label: 'Xanh dương', swatch: '#3b82f6' },
  { value: 'navy', label: 'Xanh navy', swatch: '#1e3a8a' },
  { value: 'brown', label: 'Nâu', swatch: '#92400e' },
  { value: 'gray', label: 'Xám', swatch: '#6b7280' },
  { value: 'black', label: 'Đen', swatch: '#111827' },
];

const COLOR_LABELS = COLOR_OPTIONS.reduce((acc, color) => {
  acc[color.value] = color.label;
  return acc;
}, {});

export const getColorLabel = (color) => {
  if (!color) return '';
  const normalized = String(color).trim().toLowerCase();
  return COLOR_LABELS[normalized] || color;
};

export const getColorSwatch = (color) => {
  if (!color) return 'transparent';
  const normalized = String(color).trim().toLowerCase();
  return COLOR_OPTIONS.find((item) => item.value === normalized)?.swatch || color;
};
