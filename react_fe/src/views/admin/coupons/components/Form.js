import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import { DatePicker } from 'components/calendar/DatePicker';
import CouponService from 'services/CouponService';

export default function Form({ isOpen, onClose, reloadCoupons, coupon }) {
  const toast = useAppToast();

  const [code, setCode] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [usedCount, setUsedCount] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const headerBg = useColorModeValue('gray.100', 'navy.800');

  // ✅ Helper format LocalDateTime string (yyyy-MM-ddT00:00:00)
  const toLocalDateTimeString = (dateStr) => {
    if (!dateStr) return null;
    return `${dateStr}T00:00:00`;
  };

  // Load dữ liệu khi mở form
  useEffect(() => {
    if (isOpen) {
      if (coupon) {
        setCode(coupon.code || '');
        setDiscountValue(
          coupon.discountValue !== undefined && coupon.discountValue !== null
            ? String(coupon.discountValue)
            : '',
        );
        setStartDate(coupon.startDate ? coupon.startDate.split('T')[0] : '');
        setEndDate(coupon.endDate ? coupon.endDate.split('T')[0] : '');
        setUsageLimit(
          coupon.usageLimit !== undefined && coupon.usageLimit !== null
            ? String(coupon.usageLimit)
            : '',
        );
        setUsedCount(
          coupon.usedCount !== undefined && coupon.usedCount !== null
            ? String(coupon.usedCount)
            : '',
        );
      } else {
        setCode('');
        setDiscountValue('');
        setStartDate('');
        setEndDate('');
        setUsageLimit('');
        setUsedCount('');
      }
      setErrors({});
    }
  }, [coupon, isOpen]);

  // ✅ Validate dữ liệu trước khi submit
  const validate = () => {
    const newErrors = {};

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      newErrors.code = 'Mã giảm giá là bắt buộc';
    }

    const discountNum = Number(discountValue);
    if (!discountValue) {
      newErrors.discountValue = 'Giá trị giảm giá là bắt buộc';
    } else if (Number.isNaN(discountNum)) {
      newErrors.discountValue = 'Giá trị giảm giá phải là số';
    } else if (discountNum < 1 || discountNum > 100) {
      newErrors.discountValue = 'Giá trị giảm giá phải từ 1 đến 100';
    }

    const usageLimitNum = Number(usageLimit);
    if (!usageLimit) {
      newErrors.usageLimit = 'Giới hạn sử dụng là bắt buộc';
    } else if (Number.isNaN(usageLimitNum)) {
      newErrors.usageLimit = 'Giới hạn sử dụng phải là số';
    } else if (!Number.isInteger(usageLimitNum) || usageLimitNum < 1) {
      newErrors.usageLimit = 'Giới hạn sử dụng phải là số nguyên lớn hơn 0';
    }

    const usedCountNum = coupon ? Number(usedCount || 0) : 0;
    if (coupon) {
      if (Number.isNaN(usedCountNum) || usedCountNum < 0) {
        newErrors.usedCount = 'Số lần đã dùng không hợp lệ';
      } else if (!Number.isInteger(usedCountNum)) {
        newErrors.usedCount = 'Số lần đã dùng phải là số nguyên';
      } else if (!Number.isNaN(usageLimitNum) && usedCountNum > usageLimitNum) {
        newErrors.usedCount =
          'Số lần đã dùng không được lớn hơn giới hạn sử dụng';
      }
    }

    // Validate ngày
    if (!startDate && endDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc khi có ngày kết thúc';
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Vui lòng điền đủ các trường bắt buộc');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    setLoading(true);

    const trimmedCode = code.trim();
    const discountNum = Number(discountValue);
    const usageLimitNum = Number(usageLimit);
    const usedCountNum = coupon ? Number(usedCount || 0) : 0;

    const payload = {
      code: trimmedCode,
      discountValue: discountNum,
      startDate: toLocalDateTimeString(startDate),
      endDate: toLocalDateTimeString(endDate),
      usageLimit: usageLimitNum,
      usedCount: usedCountNum,
      productId: null,
    };

    try {
      if (coupon) {
        await CouponService.update(coupon.id, payload);
        toast.success('Đã cập nhật mã giảm giá thành công!');
      } else {
        await CouponService.create(payload);
        toast.success('Đã tạo mã giảm giá thành công!');
      }
      reloadCoupons?.();
      onClose();
    } catch (err) {
      console.error('❌ Error saving coupon:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Lưu mã giảm giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="20px" bg={bgColor} color={textColor}>
        <ModalHeader bg={headerBg} borderTopRadius="20px">
          {coupon ? 'Chỉnh Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form id="create-coupon-form" onSubmit={handleSubmit}>
            <VStack spacing={4} align="flex-start">
              <FormControl isRequired isInvalid={!!errors.code}>
                <FormLabel>Mã Giảm Giá</FormLabel>
                <Input
                  color={textColor}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                />
                <FormErrorMessage>{errors.code}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.discountValue}>
                <FormLabel>Giá Trị Giảm Giá (%)</FormLabel>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  color={textColor}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="Nhập phần trăm (1-100)%"
                />
                <FormErrorMessage>{errors.discountValue}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.startDate}>
                <DatePicker
                  label="Ngày Bắt Đầu"
                  value={startDate}
                  onChange={setStartDate}
                  isRequired
                />
                <FormErrorMessage>{errors.startDate}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.endDate}>
                <DatePicker
                  label="Ngày Kết Thúc"
                  value={endDate}
                  onChange={setEndDate}
                  isRequired
                />
                <FormErrorMessage>{errors.endDate}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.usageLimit}>
                <FormLabel>Giới Hạn Sử Dụng</FormLabel>
                <Input
                  type="number"
                  min={1}
                  color={textColor}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Nhập giới hạn sử dụng"
                />
                <FormErrorMessage>{errors.usageLimit}</FormErrorMessage>
              </FormControl>
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter bg={headerBg} borderBottomRadius="20px">
          <Button variant="ghost" mr={3} onClick={onClose}>
            Hủy
          </Button>
          <Button
            colorScheme={coupon ? 'blue' : 'green'}
            type="submit"
            form="create-coupon-form"
            isLoading={loading}
          >
            {coupon ? 'Cập Nhật' : 'Tạo Mới'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
