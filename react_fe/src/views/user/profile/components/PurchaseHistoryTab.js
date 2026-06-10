import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  VStack,
  Flex,
  Image,
  Text,
  Divider,
  Button,
  useColorModeValue,
  Badge,
  Spinner,
  Tag,
  TagLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  Checkbox,
  Input,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import ReturnOrderService from 'services/ReturnOrderService';
import OrderService from 'services/OrderService';
import { useAppToast } from 'utils/ToastHelper';
import { formatUSD } from 'utils/FormatHelper';
import { PRODUCT_PLACEHOLDER, resolveImageUrl } from 'utils/ImageHelper';
import { translateOrderStatus, translatePaymentMethod } from 'utils/OrderDisplayHelper';

export default function PurchaseHistoryTab({
  orders,
  onReturnSubmitted,
  onRefresh,
  isLoading,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}) {
  const toast = useAppToast();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'navy.700');

  const filteredOrders = useMemo(() => {
  return orders.filter(order => {
    // Ẩn nếu: là VIETQR và đang PENDING
    if (order.paymentMethod === 'VIETQR' && order.status === 'PENDING') {
      return false;
    }
    // Các trường hợp còn lại: hiện hết (COD bất kỳ, VIETQR đã PAID trở lên)
    return true;
  });
}, [orders]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'yellow';
      case 'SHIPPED':
        return 'purple';
      case 'DELIVERED':
        return 'green';
      case 'COMPLETED':
        return 'blue';
      case 'PAID':
        return 'teal';
      case 'CANCELLED':
        return 'red';
      case 'RETURN':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const canReviewOrder = (status) =>
    ['COMPLETED', 'DELIVERED'].includes(String(status || '').toUpperCase());

  const goToReview = (order, item) => {
    const params = new URLSearchParams({
      orderCode: order.orderCode || '',
      orderItemId: item.id || '',
    });
    if (item.size) params.set('size', item.size);
    if (item.color) params.set('color', item.color);
    navigate(`/user/product/${item.productId}/reviews/new?${params.toString()}`);
  };

  const handleUpdateStatus = async (orderCode, newStatus) => {
    try {
      await OrderService.updateUserStatus(orderCode, newStatus);
      toast.success(`Order ${orderCode} updated to ${newStatus}`);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleOpenReturn = (order) => {
    setSelectedOrder(order);
    setReason('');
    setNote('');
    onOpen();
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrder) return;
    if (!reason.trim()) return toast.warning('Vui lòng nhập lý do hoàn trả.');

    const selectedItems =
      selectedOrder.items
        .filter((i) => i.selected)
        .map((i) => ({
          orderItemId: i.id,
          quantity: i.returnQty || 1,
          unitPrice: i.price,
        })) || [];

    if (selectedItems.length === 0)
      return toast.warning('Vui lòng chọn ít nhất một sản phẩm để hoàn trả.');

    setSubmittingReturn(true);
    try {
      await ReturnOrderService.requestReturn({
        orderCode: selectedOrder.orderCode,
        reason,
        note,
        items: selectedItems,
      });
      toast.success('Yêu cầu hoàn trả đã được gửi!');
      onClose();
      onReturnSubmitted?.();
    } catch (err) {
      console.error(err);
      toast.error('Gửi yêu cầu hoàn trả thất bại');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // --- Infinite scroll handler ---
  const handleScroll = (e) => {
    if (!onLoadMore || !hasMore || loadingMore || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Khi còn <80px là chạm đáy => load thêm
    if (scrollHeight - scrollTop - clientHeight < 80) {
      onLoadMore();
    }
  };

  if (isLoading && !orders.length) {
    return (
      <Flex direction="column" align="center" py={12}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!orders.length) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">
          Bạn chưa đặt đơn hàng nào.
        </Text>
      </Box>
    );
  }
  

  return (
    <Box>
      <Heading size="md" mb={6} color={textColor}>
        Lịch Sử Mua Hàng
      </Heading>

      {/* Container có scroll */}
      <Box
        maxH="500px"
        overflowY="auto"
        onScroll={handleScroll}
        pr={2} // tránh che nội dung bởi scrollbar
      >
        <VStack align="stretch" spacing={6}>
          {filteredOrders.map((order) => (
            (() => {
              const subtotal =
                Number(order.subtotal) ||
                order.items?.reduce(
                  (sum, item) =>
                    sum + Number(item.price || 0) * Number(item.quantity || 0),
                  0,
                ) ||
                0;
              const discountAmount = Number(
                order.discountValue || order.discountAmount || 0,
              );
              const hasDiscount = discountAmount > 0;
              const couponCode =
                order.couponCode || order.discountCode || order.coupon?.code;
              const totalAmount =
                order.finalTotal ??
                order.totalAmount ??
                Math.max(subtotal - discountAmount, 0);

              return (
            <Box
              key={order.id}
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="12px"
              p={5}
              shadow="md"
            >
              {/* Header */}
              <Flex justify="space-between" align="center" mb={4}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    Đơn Hàng #{order.orderCode}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </Box>
                <Badge colorScheme={getStatusColor(order.status)} px={3} py={1}>
                  {translateOrderStatus(order.status)}
                </Badge>
              </Flex>

              {/* Items */}
              <VStack spacing={4} align="stretch" divider={<Divider />}>
                {order.items.map((item) => (
                  <Flex
                    key={item.id}
                    align="center"
                    justify="space-between"
                    gap={4}
                  >
                    <Box position="relative">
                      <Image
                        src={resolveImageUrl(item.imageUrl, item.thumbnailUrl)}
                        boxSize="80px"
                        borderRadius="8px"
                        objectFit="cover"
                        fallbackSrc={PRODUCT_PLACEHOLDER}
                      />
                      <Badge
                        position="absolute"
                        top="-8px"
                        right="-8px"
                        bg="brand.500"
                        color="white"
                        borderRadius="full"
                        px={2}
                        fontSize="xs"
                      >
                        {item.quantity}
                      </Badge>
                    </Box>

                    <Box flex="1">
                      <Text fontWeight="bold">{item.productName}</Text>
                      {(item.color || item.size) && (
                        <Tag
                          size="sm"
                          variant="subtle"
                          borderRadius="full"
                          mt={2}
                          bg="gray.200"
                        >
                          <TagLabel textTransform="capitalize">
                            {`${item.color || ''}${
                              item.color && item.size ? ' / ' : ''
                            }${item.size || ''}`}
                          </TagLabel>
                        </Tag>
                      )}
                    </Box>

                    <Flex
                      direction="column"
                      align={{ base: 'flex-start', md: 'flex-end' }}
                      gap={2}
                      minW={{ base: '100%', md: '170px' }}
                    >
                      <Text fontWeight="semibold">
                        {formatUSD(item.price * item.quantity)}
                      </Text>
                      {canReviewOrder(order.status) && (
                        item.reviewed ? (
                          <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                            Đã đánh giá
                          </Badge>
                        ) : (
                          <Button
                            size="xs"
                            colorScheme="brand"
                            variant="outline"
                            borderRadius="full"
                            onClick={() => goToReview(order, item)}
                          >
                            Đánh giá sản phẩm
                          </Button>
                        )
                      )}
                    </Flex>
                  </Flex>
                ))}
              </VStack>

              <Divider my={4} />

              {/* Footer actions */}
              <Flex
                justify="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                gap={4}
                direction={{ base: 'column', md: 'row' }}
              >
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Tạm tính: {formatUSD(subtotal)}
                  </Text>
                  {hasDiscount && (
                    <>
                      <Text fontSize="sm" color="gray.500">
                        Mã giảm giá: {couponCode || '-'}
                      </Text>
                      <Text fontSize="sm" color="red.500">
                        Giảm giá: -{formatUSD(discountAmount)}
                      </Text>
                    </>
                  )}
                  <Text fontWeight="bold" color={textColor}>
                    Tổng thanh toán: {formatUSD(totalAmount)}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Thanh toán: {translatePaymentMethod(order.paymentMethod)} -{' '}
                    {order.paymentStatus === 'PAID'
                      ? 'Đã thanh toán'
                      : order.paymentStatus === 'UNPAID'
                        ? 'Chưa thanh toán'
                        : order.paymentStatus || 'Chờ xử lý'}
                  </Text>
                </Box>

                {order.status === 'DELIVERED' && (
                  <Flex gap={3}>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() =>
                        handleUpdateStatus(order.orderCode, 'COMPLETED')
                      }
                    >
                      Xác Nhận Đã Nhận
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleOpenReturn(order)}
                    >
                      Yêu Cầu Hoàn Trả
                    </Button>
                  </Flex>
                )}
              </Flex>
            </Box>
              );
            })()
          ))}
        </VStack>

        {/* Loading + trạng thái cuối list */}
        {loadingMore && (
          <Flex justify="center" py={4}>
            <Spinner size="md" />
          </Flex>
        )}

        {!loadingMore && !hasMore && (
          <Flex justify="center" py={4}>
            <Text fontSize="sm" color="gray.400">
              Đã xem hết lịch sử đơn hàng.
            </Text>
          </Flex>
        )}
      </Box>

      {/* 🧾 Return dialog */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader>            Chọn Sản Phẩm Hoàn Trả</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack spacing={4} align="stretch" divider={<Divider />}>
                {selectedOrder.items.map((item) => (
                  <Flex
                    key={item.id}
                    align="center"
                    justify="space-between"
                    gap={4}
                    flexWrap="wrap"
                  >
                    <Flex align="center" gap={3} flex="1">
                      <Checkbox
                        isChecked={item.selected || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedOrder((prev) => ({
                            ...prev,
                            items: prev.items.map((it) =>
                              it.id === item.id
                                ? { ...it, selected: checked }
                                : it,
                            ),
                          }));
                        }}
                        colorScheme="brand"
                      />
                      <Image
                        src={resolveImageUrl(item.imageUrl, item.thumbnailUrl)}
                        boxSize="60px"
                        borderRadius="8px"
                        objectFit="cover"
                        fallbackSrc={PRODUCT_PLACEHOLDER}
                      />
                      <Box>
                        <Text fontWeight="bold">{item.productName}</Text>
                        {(item.color || item.size) && (
                          <Tag
                            size="sm"
                            variant="subtle"
                            borderRadius="full"
                            mt={1}
                            bg="gray.200"
                          >
                            <TagLabel textTransform="capitalize">
                              {`${item.color || ''}${
                                item.color && item.size ? ' / ' : ''
                              }${item.size || ''}`}
                            </TagLabel>
                          </Tag>
                        )}
                      </Box>
                    </Flex>

                    <Flex align="center" gap={2}>
                      <Input
                        type="number"
                        size="sm"
                        min={1}
                        max={item.quantity}
                        w="70px"
                        isDisabled={!item.selected}
                        value={item.returnQty ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedOrder((prev) => ({
                            ...prev,
                            items: prev.items.map((it) =>
                              it.id === item.id
                                ? { ...it, returnQty: val }
                                : it,
                            ),
                          }));
                        }}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          const qty = isNaN(val)
                            ? 1
                            : Math.max(1, Math.min(val, item.quantity));
                          setSelectedOrder((prev) => ({
                            ...prev,
                            items: prev.items.map((it) =>
                              it.id === item.id
                                ? { ...it, returnQty: qty }
                                : it,
                            ),
                          }));
                        }}
                      />
                      <Text fontSize="sm" color="gray.500">
                        / {item.quantity}
                      </Text>
                    </Flex>
                  </Flex>
                ))}
              </VStack>
            )}

            <Divider my={4} />

            <FormControl mb={4}>
              <FormLabel>Lý do hoàn trả</FormLabel>
              <Textarea
                placeholder="Nhập lý do của bạn"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Ghi chú thêm</FormLabel>
              <Textarea
                placeholder="Ghi chú (tùy chọn)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Hủy
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSubmitReturn}
              isLoading={submittingReturn}
            >
              Gửi Yêu Cầu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
