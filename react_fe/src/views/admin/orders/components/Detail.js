import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  Box,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { formatUSD } from 'utils/FormatHelper';
import ProductService from 'services/ProductService';
import { translateOrderStatus, translatePaymentMethod } from 'utils/OrderDisplayHelper';

export default function Detail({ isOpen, onClose, order }) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const [loading, setLoading] = useState(false);
  const [detailedItems, setDetailedItems] = useState([]);

  useEffect(() => {
    if (!order?.items?.length) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          order.items.map(async (item) => {
            try {
              const res = await ProductService.getDetailById(item.productId);
              const product = res.data;
              const variant = product.variants?.find(
                (v) => v.id === item.variantId || v._id === item.variantId,
              );
              return {
                ...item,
                productName: product.name,
                color: variant?.color || '-',
                size: variant?.size || '-',
              };
            } catch (err) {
              console.error(
                'Failed to fetch product detail for',
                item.productId,
              );
              return {
                ...item,
                productName: '(Sản phẩm không xác định)',
                color: '-',
                size: '-',
              };
            }
          }),
        );
        setDetailedItems(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [order]);

  if (!order) return null;

  const subtotal =
    Number(order.subtotal) ||
    order.items?.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    ) ||
    0;
  const discountAmount = Number(order.discountValue || order.discountAmount || 0);
  const hasDiscount = discountAmount > 0;
  const couponCode = order.couponCode || order.discountCode || order.coupon?.code;
  const totalAmount =
    order.finalTotal ?? order.totalAmount ?? Math.max(subtotal - discountAmount, 0);

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'SHIPPING': return 'Đang giao';
      case 'DELIVERED': return 'Đã giao';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      case 'PAID': return 'Đã thanh toán';
      case 'UNPAID': return 'Chưa thanh toán';
      case 'FAILED': return 'Thất bại';
      case 'REFUNDED': return 'Đã hoàn tiền';
      case 'RETURN': return 'Hoàn trả';
      default: return translateOrderStatus(status);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontWeight="bold">
          Chi Tiết Đơn Hàng - {order.orderCode}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex gap={4} direction={{ base: 'column', md: 'row' }} mb={4}>
            <Box flex={1}>
              <Text fontWeight="600" color={textColor} fontSize="md" mb={2}>
                Thông tin khách hàng
              </Text>
              <Text>Họ tên: {order.fullName || order.customer?.name || order.user?.fullName || '-'}</Text>
              <Text>Email: {order.email || '-'}</Text>
              <Text>SĐT: {order.phone || '-'}</Text>
              <Text>Địa chỉ: {order.address || '-'}</Text>
            </Box>
            <Box flex={1}>
              <Text fontWeight="600" color={textColor} fontSize="md" mb={2}>
                Thông tin đơn hàng
              </Text>
              <Text>Trạng thái đơn: {getStatusText(order.status)}</Text>
              <Text>Thanh toán: {getStatusText(order.paymentStatus)} ({translatePaymentMethod(order.paymentMethod)})</Text>
              <Text>Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '-'}</Text>
              <Text>Tạm tính: {formatUSD(subtotal)}</Text>
              {hasDiscount && (
                <>
                  <Text>Mã giảm giá: {couponCode || '-'}</Text>
                  <Text color="red.500">
                    Giảm giá: -{formatUSD(discountAmount)}
                  </Text>
                </>
              )}
              <Text fontWeight="bold" color="brand.500">
                Tổng thanh toán: {formatUSD(totalAmount)}
              </Text>
            </Box>
          </Flex>

          {/* 🧠 Loading state */}
          {loading ? (
            <Flex justify="center" align="center" minH="150px">
              <Spinner size="lg" color="brand.500" />
            </Flex>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th borderColor={borderColor}>#</Th>
                  <Th borderColor={borderColor}>Sản phẩm</Th>
                  <Th borderColor={borderColor}>Màu</Th>
                  <Th borderColor={borderColor}>Size</Th>
                  <Th borderColor={borderColor}>SL</Th>
                  <Th borderColor={borderColor}>Đơn giá</Th>
                  <Th borderColor={borderColor}>Thành tiền</Th>
                </Tr>
              </Thead>
              <Tbody>
                {detailedItems.map((item, idx) => (
                  <Tr key={item.id}>
                    <Td borderColor={borderColor}>{idx + 1}</Td>
                    <Td borderColor={borderColor}>
                      <Text fontWeight="600" noOfLines={2}>
                        {item.productName}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor} textTransform="capitalize">
                      {item.color}
                    </Td>
                    <Td borderColor={borderColor}>{item.size}</Td>
                    <Td borderColor={borderColor}>{item.quantity}</Td>
                    <Td borderColor={borderColor} color="brand.500">
                      {formatUSD(item.price)}
                    </Td>
                    <Td borderColor={borderColor} color="brand.500" fontWeight="bold">
                      {formatUSD((item.price || 0) * (item.quantity || 1))}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
