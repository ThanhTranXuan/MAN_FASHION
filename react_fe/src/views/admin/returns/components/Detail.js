import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import OrderService from 'services/OrderService';
import { formatCurrencyVND } from 'utils/FormatHelper';
import {
  translateOrderStatus,
  translatePaymentMethod,
  translateReturnStatus,
} from 'utils/OrderDisplayHelper';

export default function Detail({ isOpen, onClose, returnOrder }) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !returnOrder?.orderCode) return;

    const loadOrder = async () => {
      setLoading(true);
      try {
        const res = await OrderService.getAllAdmin({
          page: 0,
          size: 5,
          code: returnOrder.orderCode,
        });
        const orders = res.data?.content || [];
        setOrder(
          orders.find((item) => item.orderCode === returnOrder.orderCode) ||
            orders[0] ||
            null,
        );
      } catch (err) {
        console.error('Failed to load return order detail:', err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [isOpen, returnOrder?.orderCode]);

  const returnedItems = useMemo(() => {
    const orderItems = order?.items || [];
    return (returnOrder?.items || []).map((item) => {
      const matched = orderItems.find(
        (orderItem) =>
          String(orderItem.orderItemId || orderItem.id) ===
          String(item.orderItemId),
      );
      return {
        ...item,
        productName: matched?.productName || 'Sản phẩm',
        color: matched?.color || matched?.variantColor || '-',
        size: matched?.size || matched?.variantSize || '-',
      };
    });
  }, [order?.items, returnOrder?.items]);

  if (!returnOrder) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent maxH="calc(100vh - 32px)">
        <ModalHeader fontWeight="bold">
          Chi tiết đơn hoàn - {returnOrder.returnCode}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" pb={6}>
          {loading ? (
            <Flex justify="center" align="center" minH="220px">
              <Spinner size="lg" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Flex gap={4} direction={{ base: 'column', md: 'row' }} mb={4}>
                <Box flex={1}>
                  <Text fontWeight="600" color={textColor} fontSize="md" mb={2}>
                    Thông tin khách hàng
                  </Text>
                  <Text>Người đặt: {order?.fullName || '-'}</Text>
                  <Text>Email: {order?.email || '-'}</Text>
                  <Text>SĐT: {order?.phone || '-'}</Text>
                  <Text>Địa chỉ: {order?.address || '-'}</Text>
                </Box>
                <Box flex={1}>
                  <Text fontWeight="600" color={textColor} fontSize="md" mb={2}>
                    Thông tin hoàn trả
                  </Text>
                  <Text>Mã đơn hàng: {returnOrder.orderCode || '-'}</Text>
                  <Text>
                    Ngày đặt:{' '}
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleString('vi-VN')
                      : '-'}
                  </Text>
                  <Text>
                    Ngày yêu cầu:{' '}
                    {returnOrder.createdAt
                      ? new Date(returnOrder.createdAt).toLocaleString('vi-VN')
                      : '-'}
                  </Text>
                  <Text>
                    Trạng thái đơn: {translateOrderStatus(order?.status)}
                  </Text>
                  <Text>
                    Trạng thái hoàn trả:{' '}
                    {translateReturnStatus(returnOrder.status)}
                  </Text>
                  <Text>
                    Thanh toán: {translatePaymentMethod(order?.paymentMethod)}
                  </Text>
                  <Text fontWeight="bold" color="brand.500">
                    Tổng tiền: {formatCurrencyVND(order?.finalTotal || 0)}
                  </Text>
                </Box>
              </Flex>

              <Box mb={4}>
                <Text fontWeight="600" color={textColor} fontSize="md" mb={2}>
                  Lý do và ghi chú
                </Text>
                <Text>Lý do hoàn trả: {returnOrder.reason || '-'}</Text>
                <Text>Ghi chú: {returnOrder.note || '-'}</Text>
                {returnOrder.rejectReason && (
                  <Text>Lý do từ chối: {returnOrder.rejectReason}</Text>
                )}
              </Box>

              <Box overflowX="auto">
                <Table variant="simple" size="sm" minW="760px">
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor}>#</Th>
                      <Th borderColor={borderColor}>Sản phẩm</Th>
                      <Th borderColor={borderColor}>Màu</Th>
                      <Th borderColor={borderColor}>Size</Th>
                      <Th borderColor={borderColor}>Số lượng</Th>
                      <Th borderColor={borderColor}>Đơn giá</Th>
                      <Th borderColor={borderColor}>Thành tiền</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {returnedItems.map((item, index) => (
                      <Tr key={item.id || item.orderItemId}>
                        <Td borderColor={borderColor}>{index + 1}</Td>
                        <Td borderColor={borderColor}>
                          <Text fontWeight="600" noOfLines={2}>
                            {item.productName}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>{item.color}</Td>
                        <Td borderColor={borderColor}>{item.size}</Td>
                        <Td borderColor={borderColor}>{item.quantity}</Td>
                        <Td borderColor={borderColor} color="brand.500">
                          {formatCurrencyVND(item.unitPrice)}
                        </Td>
                        <Td
                          borderColor={borderColor}
                          color="brand.500"
                          fontWeight="bold"
                        >
                          {formatCurrencyVND(
                            (item.unitPrice || 0) * (item.quantity || 1),
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
