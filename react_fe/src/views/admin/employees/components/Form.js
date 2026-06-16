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

export default function Form({ isOpen, onClose, reloadEmployees, editingEmployee }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
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
      setPassword('');
    } else {
      setEmail('');
      setFullName('');
      setPassword('');
    }
    setErrors({});
  }, [editingEmployee, isOpen]);

  const validate = () => {
    const newErrors = {};
    const nameTrimmed = fullName.trim();
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameTrimmed) newErrors.fullName = 'Ho ten la bat buoc';
    if (!emailTrimmed) newErrors.email = 'Email la bat buoc';
    else if (!emailRegex.test(emailTrimmed)) newErrors.email = 'Email khong hop le';

    if (!editingEmployee) {
      if (!password) newErrors.password = 'Mat khau la bat buoc';
      else if (password.length < 6) newErrors.password = 'Mat khau phai co it nhat 6 ky tu';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Vui long sua cac loi xac thuc');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payloadBase = {
        fullName: fullName.trim(),
        email: email.trim(),
      };

      if (editingEmployee) {
        await EmployeeService.update(editingEmployee.id, {
          fullName: payloadBase.fullName,
        });
        toast.success('Da cap nhat nhan vien thanh cong!');
      } else {
        await EmployeeService.create({
          ...payloadBase,
          password,
        });
        toast.success('Da tao nhan vien thanh cong!');
      }

      reloadEmployees?.();
      onClose();
    } catch (error) {
      console.error('Employee save error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Luu thong tin nhan vien that bai');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="16px" bg={bgColor} color={textColor} maxH="calc(100vh - 32px)">
        <ModalHeader bg={headerBg} borderTopRadius="20px">
          {editingEmployee ? 'Chinh Sua Nhan Vien' : 'Them Nhan Vien'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={3} isRequired isInvalid={!!errors.fullName}>
            <FormLabel>Ho Ten</FormLabel>
            <Input
              color={textColor}
              placeholder="Nhap ho ten"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <FormErrorMessage>{errors.fullName}</FormErrorMessage>
          </FormControl>

          <FormControl mb={3} isRequired isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              color={textColor}
              placeholder="Nhap email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!editingEmployee}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          {!editingEmployee && (
            <FormControl mb={3} isRequired isInvalid={!!errors.password}>
              <FormLabel>Mat Khau</FormLabel>
              <Input
                color={textColor}
                type="password"
                placeholder="Nhap mat khau"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
          )}
        </ModalBody>

        <ModalFooter bg={headerBg} borderBottomRadius="20px">
          <Button
            onClick={handleSubmit}
            colorScheme={editingEmployee ? 'blue' : 'green'}
            mr={3}
            isLoading={loading}
          >
            {editingEmployee ? 'Cap Nhat' : 'Tao Moi'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
