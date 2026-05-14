export const formatCurrency = (value) => {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(numberValue);
};

export const formatUSD = formatCurrency; // Alias to prevent breaking existing imports

export const formatCompact = (value) => {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(numberValue);
};
