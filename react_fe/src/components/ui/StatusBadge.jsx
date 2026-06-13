import React from 'react';
import { Badge } from '@chakra-ui/react';

const labels = {
  PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả hàng', UNPAID: 'Chưa thanh toán', PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại', REFUNDED: 'Đã hoàn tiền', REQUESTED: 'Đã gửi yêu cầu',
  APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', RECEIVED: 'Đã nhận hàng',
};
const schemes = {
  PENDING: 'orange', CONFIRMED: 'blue', PROCESSING: 'blue', SHIPPING: 'blue',
  COMPLETED: 'green', PAID: 'green', APPROVED: 'green', RECEIVED: 'green',
  CANCELLED: 'red', FAILED: 'red', REJECTED: 'red', RETURNED: 'purple',
  REFUNDED: 'purple', REQUESTED: 'orange', UNPAID: 'orange',
};

export default function StatusBadge({ status, ...props }) {
  const normalized = String(status || '').toUpperCase();
  return <Badge colorScheme={schemes[normalized] || 'gray'} {...props}>{labels[normalized] || status || 'Không xác định'}</Badge>;
}
