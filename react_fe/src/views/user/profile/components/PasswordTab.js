import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import ProfileService from 'services/ProfileService';
import { useUser } from 'contexts/UserContext';

export default function PasswordTab() {
  const toast = useAppToast();
  const { user } = useUser();
  const bgColor = useColorModeValue('fashion.softSurface', 'navy.800');
  const borderColor = useColorModeValue('fashion.stone', 'gray.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const isGoogleOnlyAccount = user?.socialProvider?.toUpperCase() === 'GOOGLE';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Mật khẩu không khớp');
        return;
      }
      await ProfileService.changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  if (isGoogleOnlyAccount) {
    return (
      <Box
        bg={bgColor}
        p={{ base: 4, md: 6 }}
        borderRadius="16px"
        border="1px solid"
        borderColor={borderColor}
        w={{ base: '100%', md: '60%', lg: '50%' }}
        mx="auto"
      >
        <Text color={textColor}>
          Tài khoản này đăng nhập bằng Google nên mật khẩu được quản lý bởi Google.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      bg={bgColor}
      p={{ base: 4, md: 6 }}
      borderRadius="16px"
      border="1px solid"
      borderColor={borderColor}
      w={{ base: '100%', md: '60%', lg: '50%' }}
      mx="auto"
    >
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Mật Khẩu Hiện Tại</FormLabel>
          <Input
            color={textColor}
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Mật Khẩu Mới</FormLabel>
          <Input
            color={textColor}
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Xác Nhận Mật Khẩu Mới</FormLabel>
          <Input
            color={textColor}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </FormControl>
      </VStack>
      <Button colorScheme="brand" color="white" onClick={handleSubmit} mt={5} w="full">
        Đổi Mật Khẩu
      </Button>
    </Box>
  );
}
