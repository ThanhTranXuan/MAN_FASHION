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
  Image,
  Input,
  Text,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import DefaultAuth from 'layouts/auth/Default';
import AuthService from 'services/AuthService';

const authHeroImage =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80';

function ForgotPassword() {
  const textColor = useColorModeValue('#0B0B0B', 'white');
  const textColorSecondary = useColorModeValue('#4B5563', 'gray.300');
  const panelBg = useColorModeValue('fashion.pageBg', 'navy.800');
  const inputBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const toast = useAppToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
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
    <DefaultAuth illustrationBackground={authHeroImage} image={authHeroImage}>
      <Flex
        maxW={{ base: '100%', lg: '1040px' }}
        w="100%"
        mx="auto"
        h="100%"
        alignItems="center"
        justifyContent="center"
        mb={{ base: 8, md: 12 }}
        px={{ base: 4, md: 0 }}
        mt={{ base: 6, md: 8 }}
      >
        <Flex
          w="100%"
          direction={{ base: 'column', lg: 'row' }}
          bg={panelBg}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 22px 60px rgba(15, 23, 42, 0.14)"
          overflow="hidden"
          minH={{ base: 'auto', lg: '560px' }}
        >
          <Box display={{ base: 'none', lg: 'block' }} flex="0 0 42%" position="relative" bg="#0B0B0B">
            <Image
              src={authHeroImage}
              alt="Thời trang Trendify"
              position="absolute"
              inset={0}
              w="100%"
              h="100%"
              objectFit="cover"
              opacity={0.76}
            />
            <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.82))" />
            <Box position="absolute" left={8} right={8} bottom={8} color="white">
              <Text fontSize="xs" fontWeight="900" letterSpacing="0.18em" textTransform="uppercase" color="#FDBA74" mb={4}>
                Trendify
              </Text>
              <Heading fontSize={{ lg: '4xl', xl: '5xl' }} lineHeight="1.05" mb={4}>
                Khôi phục tài khoản của bạn.
              </Heading>
              <Text color="whiteAlpha.800" lineHeight="1.8">
                Nhận liên kết đặt lại mật khẩu qua email và tiếp tục mua sắm.
              </Text>
            </Box>
          </Box>

          <Box flex="1" p={{ base: 6, md: 8, xl: 10 }} bg={panelBg} alignSelf="center">
            <Text fontSize="xs" fontWeight="900" letterSpacing="0.18em" textTransform="uppercase" color="#F97316" mb={4}>
              Tài khoản Trendify
            </Text>
            <Heading color={textColor} fontSize={{ base: '3xl', md: '4xl' }} lineHeight="1.05" mb={4}>
              Quên mật khẩu?
            </Heading>
            <Text color={textColorSecondary} mb={8} lineHeight="1.7">
              Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu.
            </Text>

            <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="800">Email</FormLabel>
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                mb="24px"
                size="lg"
                borderRadius="0"
                bg={inputBg}
                borderColor={borderColor}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isDisabled={loading}
                onKeyDown={(event) => event.key === 'Enter' && handleForgotPassword()}
              />

              <Button
                w="100%"
                h="52px"
                borderRadius="0"
                bg="#0B0B0B"
                color="white"
                fontWeight="900"
                _hover={{ bg: '#F97316' }}
                onClick={handleForgotPassword}
                isLoading={loading}
                loadingText="Đang gửi..."
                spinner={<Spinner size="sm" />}
              >
                Gửi liên kết đặt lại mật khẩu
              </Button>
            </FormControl>
          </Box>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default ForgotPassword;
