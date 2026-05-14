import React, { useState } from 'react';
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
  Input,
  HStack,
  Badge,
  Tag,
  TagLabel,
  RadioGroup,
  Radio,
  Stack,
  Icon,
} from '@chakra-ui/react';
import { FaMoneyBillWave, FaQrcode } from 'react-icons/fa';
import { useAppToast } from 'utils/ToastHelper';
import { formatUSD } from 'utils/FormatHelper';
import CouponService from 'services/CouponService';
import OrderService from 'services/OrderService';
import { useCart } from 'contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useEffect} from 'react';

export default function Summary({ cart, formData }) {
  const sectionBg = useColorModeValue('gray.50', 'navy.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useAppToast();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [applied, setApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('VIETQR');

  const subtotal = cart.totalPrice || 0;
  const discountValue = subtotal * discountPercent;
  const finalTotal = subtotal - discountValue;
  const [checkoutSessionId, setCheckoutSessionId] = useState('');

  useEffect(() => {
    let sessionId = localStorage.getItem('checkoutSessionId');

    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('checkoutSessionId', sessionId);
      console.log('Tạo mới checkoutSessionId:', sessionId);
    } else {
      console.log('Dùng lại checkoutSessionId:', sessionId);
    }

    setCheckoutSessionId(sessionId);
  }, []);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return toast.info('Vui lòng nhập mã giảm giá.');

    try {
      const { data } = await CouponService.getAll({ code });
      const coupon = data?.content?.find((c) => c.code === code && c.active);

      if (!coupon) {
        setDiscountPercent(0);
        setApplied(false);
        setSelectedCouponId(null);
        return toast.warning('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      }

      const now = new Date();
      if (
        (coupon.startDate && now < new Date(coupon.startDate)) ||
        (coupon.endDate && now > new Date(coupon.endDate))
      ) {
        setDiscountPercent(0);
        setApplied(false);
        setSelectedCouponId(null);
        return toast.warning('Mã giảm giá chưa hiệu lực hoặc đã hết hạn.');
      }

      setSelectedCouponId(coupon.id);
      setDiscountPercent((coupon.discountValue || 0) / 100);
      setApplied(true);
      toast.success(
        `Áp dụng mã giảm giá thành công! Giảm ${coupon.discountValue}%`,
      );
    } catch (err) {
      toast.error('Không thể kiểm tra mã giảm giá.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart?.items?.length) return toast.warning('Giỏ hàng của bạn đang trống!');
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.addressStreet ||
      !formData.addressCity
    )
      return toast.warning('Vui lòng điền đủ thông tin giao hàng.');

    setIsLoading(true);

    try {
      const fullAddress = [
        formData.addressStreet,
        formData.addressWard,
        formData.addressDistrict,
        formData.addressCity,
      ]
        .filter(Boolean)
        .join(', ');

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        couponId: applied ? selectedCouponId : null,
        paymentMethod: paymentMethod,
        items: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        checkoutSessionId,
      };


      const order = await OrderService.create(payload);

      if (paymentMethod === 'COD') {
        clearCart();
        localStorage.removeItem('checkoutSessionId');
        toast.success(
          'Đặt hàng thành công! Chúng tôi sẽ giao hàng và thu tiền khi nhận hàng.',
        );
        navigate('/user/home');
        return;
      }

      if (order?.paymentLink) {
        toast.success('Đang chuyển hướng đến trang thanh toán...');
        window.location.href = order.paymentLink;
      } else {
        console.error('Order created but missing paymentLink', order);
        toast.error('Không thể khởi tạo thanh toán. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại!',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box flex="1" bg={sectionBg} p={6} borderRadius="16px" boxShadow="lg">
      <Heading size="md" mb={6} color={textColor}>
        Tóm Tắt Đơn Hàng
      </Heading>

      {/* Order details luôn hiển thị */}
      <Box
        mb={4}
        maxH="260px"
        overflowY="auto"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="12px"
        p={3}
      >
        <VStack spacing={3} align="stretch">
          {cart.items.map((item) => (
            <Flex
              key={`${item.productId}-${item.variantId}`}
              align="center"
              justify="space-between"
              gap={3}
            >
              <Box position="relative">
                <Image
                  src={item.thumbnailUrl}
                  boxSize="64px"
                  borderRadius="12px"
                  objectFit="cover"
                  fallbackSrc="/placeholder.jpg"
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
                <Text fontWeight="bold" noOfLines={2}>
                  {item.productName}
                </Text>
                {(item.color || item.size) && (
                  <Tag size="sm" variant="subtle" colorScheme="blue" mt={1}>
                    <TagLabel textTransform="capitalize">
                      {[item.color, item.size].filter(Boolean).join(' • ')}
                    </TagLabel>
                  </Tag>
                )}
              </Box>
              <Text fontWeight="semibold" color="brand.500">
                {formatUSD(item.price * item.quantity)}
              </Text>
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Coupon Code */}
      <Box mb={4}>
        <Text fontWeight="semibold" mb={2}>
          Mã Giảm Giá
        </Text>
        <HStack>
          <Input
            placeholder="Nhập mã giảm giá..."
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            isDisabled={applied}
            borderRadius="12px"
          />
          <Button
            colorScheme={applied ? 'green' : 'brand'}
            onClick={handleApplyCoupon}
            isDisabled={applied}
            minW="100px"
            color="white" // chữ luôn trắng
          >
            {applied ? 'Đã Áp Dụng' : 'Áp Dụng'}
          </Button>
        </HStack>
      </Box>

      {/* Total Amount */}
      <VStack
        spacing={3}
        align="stretch"
        mb={6}
        p={4}
        borderRadius="12px"
        border="1px solid"
        borderColor={borderColor}
      >
        <Flex justify="space-between">
          <Text>Tạm Tính</Text>
          <Text>{formatUSD(subtotal)}</Text>
        </Flex>
        {applied && (
          <Flex justify="space-between" color="green.400" fontWeight="medium">
            <Text>Giảm Giá</Text>
            <Text>-{formatUSD(discountValue)}</Text>
          </Flex>
        )}
        <Divider />
        <Flex justify="space-between" fontSize="xl" fontWeight="bold">
          <Text>Tổng Cộng</Text>
          <Text color="brand.500">{formatUSD(finalTotal)}</Text>
        </Flex>
      </VStack>

      {/* Payment Method - cùng 1 dòng */}
      <Box mb={4}>
        <Text fontWeight="semibold" mb={2}>
          Phương Thức Thanh Toán
        </Text>
        <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
          <Stack direction="row" spacing={4} align="stretch">
            <Radio value="VIETQR" size="md">
              <Flex align="center" gap={2}>
                <Icon as={FaQrcode} />
                <Text fontSize="sm" fontWeight="medium">
                  VietQR (PayOS)
                </Text>
              </Flex>
            </Radio>
            <Radio value="COD" size="md">
              <Flex align="center" gap={2}>
                <Icon as={FaMoneyBillWave} />
                <Text fontSize="sm" fontWeight="medium">
                  COD
                </Text>
              </Flex>
            </Radio>
          </Stack>
        </RadioGroup>
      </Box>

      {/* Order button */}
      <Button
        colorScheme="brand"
        size="lg"
        w="full"
        h="56px"
        borderRadius="16px"
        fontSize="lg"
        fontWeight="bold"
        onClick={handlePlaceOrder}
        isLoading={isLoading}
        loadingText="Đang xử lý..."
        boxShadow="lg"
        color="white"
      >
        {paymentMethod === 'COD'
          ? 'Đặt Hàng (Thanh Toán Khi Nhận Hàng)'
          : 'Thanh Toán Qua VietQR'}
      </Button>
    </Box>
  );
}
