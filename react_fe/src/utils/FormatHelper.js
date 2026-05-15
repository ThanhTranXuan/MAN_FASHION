export const formatCurrencyVND = (value) => {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(numberValue);
};

export const formatCurrency = formatCurrencyVND;
export const formatUSD = formatCurrencyVND; // Added for backwards compatibility with files still using formatUSD

export const formatCompact = (value) => {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(numberValue);
};
