// views/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import DefaultAuth from 'layouts/auth/Default';
import illustration from 'assets/img/auth/auth.png';
import AuthService from 'services/AuthService';

function ForgotPassword() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const toast = useAppToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.warning('Please enter your email.');
      toast.warning('Vui lòng nhập email của bạn.');
      return;
    }

    try {
      setLoading(true);
      await AuthService.forgotPassword(email);
      toast.success('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.');
      navigate('/auth/check-email');
    } catch (error) {
      console.error(error);
      toast.error('Không tìm thấy tài khoản với email này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: '100%', md: 'max-content' }}
        w="100%"
        mx={{ base: 'auto', lg: '0px' }}
        me="auto"
        h="70vh"
        alignItems="center"
        justifyContent="flex-start"
        flexDirection="column"
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '5vh' }}
      >
        <Box>
          <Heading color={textColor} fontSize="32px" mb="10px">
            Quên Mật Khẩu?
          </Heading>
          <Text color={textColorSecondary} mb="24px">
            Nhập email của bạn bên dưới và chúng tôi sẽ gửi cho bạn mã xác nhận lại mật khẩu.
          </Text>

          <FormControl>
            <FormLabel color={textColor}>Email</FormLabel>
            <Input
              type="email"
              placeholder="Nhập email của bạn"
              mb="24px"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isDisabled={loading}
            />

            <Button
              w="100%"
              variant="brand"
              onClick={handleForgotPassword}
              isLoading={loading}
              loadingText="Đang gửi..."
              spinner={<Spinner size="sm" />}
            >
              Gửi Yêu Cầu Link
            </Button>
          </FormControl>
        </Box>
      </Flex>
    </DefaultAuth>
  );
}

export default ForgotPassword;
