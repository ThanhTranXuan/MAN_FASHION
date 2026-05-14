import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import ProfileService from 'services/ProfileService';

export default function DeleteAccountTab() {
  const toast = useAppToast();
  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');

  useEffect(() => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCode(randomCode);
  }, []);

  const handleDelete = async () => {
    if (input !== code) {
      toast.error('Mã xác nhận không đúng');
      return;
    }
    try {
      await ProfileService.deleteAccount();
      toast.success('Đã xóa tài khoản');
      window.location.href = '/auth/sign-in';
    } catch (err) {
      console.error(err);
      toast.error('Xóa tài khoản thất bại');
    }
  };

  return (
    <Box
      bg={bgColor}
      p={{ base: 4, md: 6 }}
      borderRadius="16px"
      w={{ base: '100%', md: '60%', lg: '50%' }}
      mx="auto"
    >
      <VStack spacing={4} align="stretch">
        <Text>Để xóa tài khoản, hãy nhập mã bên dưới để xác nhận:</Text>
        <Text fontWeight="bold" fontSize="xl">
          {code}
        </Text>

        <FormControl>
          <FormLabel>Nhập Mã</FormLabel>
          <Input
            color={textColor}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </FormControl>
      </VStack>
      <Button colorScheme="red" onClick={handleDelete} mt={5} w="full">
        Xóa Tài Khoản
      </Button>
    </Box>
  );
}
