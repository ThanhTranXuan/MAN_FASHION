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
      newErrors.fullName = 'Full name is required';
    }

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(emailTrimmed)) {
      newErrors.email = 'Invalid email format';
    }

    // Password chỉ required khi tạo mới
    if (!editingEmployee) {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    const rateNum = Number(hourlyRate);
    if (!hourlyRate && hourlyRate !== 0) {
      newErrors.hourlyRate = 'Hourly rate is required';
    } else if (Number.isNaN(rateNum)) {
      newErrors.hourlyRate = 'Hourly rate must be a number';
    } else if (rateNum <= 0) {
      newErrors.hourlyRate = 'Hourly rate must be greater than 0';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the validation errors');
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
        toast.success('Employee updated successfully');
      } else {
        await EmployeeService.create({
          ...payloadBase,
          password,
        });
        toast.success('Employee created successfully');
      }

      reloadEmployees?.();
      onClose();
    } catch (error) {
      console.error('❌ Employee save error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Error saving employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="20px" bg={bgColor} color={textColor}>
        <ModalHeader bg={headerBg} borderTopRadius="20px">
          {editingEmployee ? 'Edit Employee' : 'Create Employee'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={3} isRequired isInvalid={!!errors.fullName}>
            <FormLabel>Full Name</FormLabel>
            <Input
              color={textColor}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <FormErrorMessage>{errors.fullName}</FormErrorMessage>
          </FormControl>

          <FormControl mb={3} isRequired isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              color={textColor}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!editingEmployee}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          {!editingEmployee && (
            <FormControl mb={3} isRequired isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                color={textColor}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
          )}

          <FormControl isRequired isInvalid={!!errors.hourlyRate}>
            <FormLabel>Hourly Rate</FormLabel>
            <Input
              color={textColor}
              type="number"
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
            {editingEmployee ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
