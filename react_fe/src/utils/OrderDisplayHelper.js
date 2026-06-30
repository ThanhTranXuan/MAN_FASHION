const formatFallback = (value) =>
  value
    ? String(value)
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Không xác định';

export const translateOrderStatus = (status) => {
  const map = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPING: 'Đang giao hàng',
    SHIPPED: 'Đang giao hàng',
    DELIVERING: 'Đang giao hàng',
    DELIVERED: 'Đã giao hàng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    RETURN: 'Yêu cầu trả hàng',
    RETURN_REQUESTED: 'Yêu cầu trả hàng',
    REQUEST_RETURN: 'Yêu cầu trả hàng',
    REFUND_REQUESTED: 'Yêu cầu trả hàng',
    RETURNED: 'Đã trả lại',
    REFUNDING: 'Đang hoàn tiền',
    REFUNDED: 'Đã hoàn tiền',
    FAILED: 'Thất bại',
    PAID: 'Đã thanh toán',
  };

  return map[String(status || '').toUpperCase()] || formatFallback(status);
};

export const translatePaymentMethod = (method) => {
  const map = {
    COD: 'Thanh toán khi nhận hàng',
    VIETQR: 'VietQR',
    PAYOS: 'PayOS',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
    CASH: 'Tiền mặt',
  };

  return map[String(method || '').toUpperCase()] || formatFallback(method);
};

export const translateReturnStatus = (status) => {
  const map = {
    REQUESTED: 'Đã gửi yêu cầu',
    PENDING: 'Chờ xử lý',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Đã từ chối',
    RECEIVED: 'Đã nhận hàng trả',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Hoàn tất hoàn trả',
    CANCELLED: 'Đã hủy',
  };

  return map[String(status || '').toUpperCase()] || formatFallback(status);
};
