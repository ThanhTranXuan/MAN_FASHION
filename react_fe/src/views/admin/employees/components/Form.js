import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';

import EmployeeService from 'services/EmployeeService';

export default function Form({
  isOpen,
  onClose,
  reloadEmployees,
  editingEmployee,
}) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const toast = useAppToast();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const headerBg = useColorModeValue('gray.100', 'navy.800');

  useEffect(() => {
    if (editingEmployee) {
      setEmail(editingEmployee.email || '');
      setFullName(editingEmployee.fullName || '');
      setHourlyRate(
        editingEmployee.hourlyRate !== undefined &&
        editingEmployee.hourlyRate !== null
          ? String(editingEmployee.hourlyRate)
          : '',
      );
      setPassword('');
    } else {
      setEmail('');
      setFullName('');
      setHourlyRate('');
      setPassword('');
    }
    setErrors({});
  }, [editingEmployee, isOpen]);

  const validate = () => {
    const newErrors = {};

    const nameTrimmed = fullName.trim();
    if (!nameTrimmed) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!emailRegex.test(emailTrimmed)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Password chỉ required khi tạo mới
    if (!editingEmployee) {
      if (!password) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }

    const rateNum = Number(hourlyRate);
    if (!hourlyRate && hourlyRate !== 0) {
      newErrors.hourlyRate = 'Lương giờ là bắt buộc';
    } else if (Number.isNaN(rateNum)) {
      newErrors.hourlyRate = 'Lương giờ phải là số';
    } else if (rateNum <= 0) {
      newErrors.hourlyRate = 'Lương giờ phải lớn hơn 0';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Vui lòng sửa các lỗi xác thực');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const rateNum = Number(hourlyRate);
      const payloadBase = {
        fullName: fullName.trim(),
        email: email.trim(),
        hourlyRate: rateNum,
      };

      if (editingEmployee) {
        // Update chỉ cần những field cho phép sửa, VD: hourlyRate, fullName
        await EmployeeService.update(editingEmployee.id, {
          hourlyRate: rateNum,
          fullName: payloadBase.fullName,
        });
        toast.success('Đã cập nhật nhân viên thành công!');
      } else {
        await EmployeeService.create({
          ...payloadBase,
          password,
        });
        toast.success('Đã tạo nhân viên thành công!');
      }

      reloadEmployees?.();
      onClose();
    } catch (error) {
      console.error('❌ Employee save error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Lưu thông tin nhân viên thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="16px" bg={bgColor} color={textColor} maxH="calc(100vh - 32px)">
        <ModalHeader bg={headerBg} borderTopRadius="20px">
          {editingEmployee ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={3} isRequired isInvalid={!!errors.fullName}>
            <FormLabel>Họ Tên</FormLabel>
            <Input
              color={textColor}
              placeholder="Nhập họ tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <FormErrorMessage>{errors.fullName}</FormErrorMessage>
          </FormControl>

          <FormControl mb={3} isRequired isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              color={textColor}
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!editingEmployee}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          {!editingEmployee && (
            <FormControl mb={3} isRequired isInvalid={!!errors.password}>
              <FormLabel>Mật Khẩu</FormLabel>
              <Input
                color={textColor}
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
          )}

          <FormControl isRequired isInvalid={!!errors.hourlyRate}>
            <FormLabel>Lương Giờ (₫/giờ)</FormLabel>
            <Input
              color={textColor}
              type="number"
              placeholder="Nhập lương giờ"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
            <FormErrorMessage>{errors.hourlyRate}</FormErrorMessage>
          </FormControl>
        </ModalBody>

        <ModalFooter bg={headerBg} borderBottomRadius="20px">
          <Button
            onClick={handleSubmit}
            colorScheme={editingEmployee ? 'blue' : 'green'}
            mr={3}
            isLoading={loading}
          >
            {editingEmployee ? 'Cập Nhật' : 'Tạo Mới'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
