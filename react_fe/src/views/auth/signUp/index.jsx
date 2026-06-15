import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import DefaultAuth from 'layouts/auth/Default';
import AuthService from 'services/AuthService';
import { useAppToast } from 'utils/ToastHelper';

const authHeroImage =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80';

function SignUp() {
  const textColor = useColorModeValue('#0B0B0B', 'white');
  const textColorSecondary = useColorModeValue('#4B5563', 'gray.300');
  const textColorBrand = useColorModeValue('#F97316', '#FDBA74');
  const brandStars = useColorModeValue('red.500', 'red.400');
  const panelBg = useColorModeValue('fashion.pageBg', 'navy.800');
  const inputBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');

  const navigate = useNavigate();
  const toast = useAppToast();

  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShowPassword = () => setShowPassword(!showPassword);

  const handleEmailPasswordSignUp = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự in hoa');
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự thường');
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu không khớp.');
      return;
    }

    try {
      setLoading(true);
      await AuthService.register({ fullName, email, password });
      toast.success('Đăng ký thành công! Hãy kiểm tra email của bạn.');
      navigate('/auth/sign-in');
    } catch (error) {
      console.error(error);
      const status = error.response?.status;
      const errorCode = error.response?.data?.code;
      const backendMessage = error.response?.data?.message;

      if (status === 409 || errorCode === 3002) {
        toast.error('Email đã tồn tại.');
      } else {
        toast.error(backendMessage || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
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
          zIndex="2"
          direction={{ base: 'column', lg: 'row' }}
          w="100%"
          bg={panelBg}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 22px 60px rgba(15, 23, 42, 0.14)"
          overflow="hidden"
          minH={{ base: 'auto', lg: '660px' }}
        >
          <Box
            display={{ base: 'none', lg: 'block' }}
            flex="0 0 42%"
            position="relative"
            minH={{ lg: '660px' }}
            bg="#0B0B0B"
            overflow="hidden"
          >
            <Image
              src={authHeroImage}
              alt="Gia nhập Trendify"
              position="absolute"
              inset={0}
              w="100%"
              h="100%"
              objectFit="cover"
              opacity={0.76}
            />
            <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.82))" />
            <Box position="absolute" left={8} right={8} bottom={8} color="white">
              <Text
                fontSize="xs"
                fontWeight="950"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="#FDBA74"
                mb={4}
              >
                Gia nhập Trendify
              </Text>
              <Heading fontSize={{ lg: '4xl', xl: '5xl' }} lineHeight="1" letterSpacing="-0.04em" mb={4}>
                Một tài khoản cho phong cách của bạn.
              </Heading>
              <Text color="whiteAlpha.800" lineHeight="1.8">
                Lưu giỏ hàng, theo dõi đơn hàng, nhận ưu đãi và gợi ý phối đồ phù hợp hơn.
              </Text>
            </Box>
          </Box>

          <Box flex="1" p={{ base: 5, sm: 6, md: 8, xl: 10 }} bg={panelBg}>
            <Box mb={{ base: 6, md: 7 }}>
              <Text
                fontSize="xs"
                fontWeight="950"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="#F97316"
                mb={4}
              >
                Tài khoản mới
              </Text>
              <Heading color={textColor} fontSize={{ base: '3xl', md: '4xl' }} lineHeight="1" letterSpacing="-0.035em" mb={4}>
                Tạo tài khoản
              </Heading>
              <Text color={textColorSecondary} fontSize="md" lineHeight="1.7">
                Bắt đầu lưu giỏ hàng, theo dõi đơn hàng và nhận gợi ý phối đồ từ Trendify.
              </Text>
            </Box>

            <FormControl>
              <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="800" color={textColor} mb="8px">
                Họ tên đầy đủ<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired
                variant="auth"
                type="text"
                placeholder="Nhập họ tên"
                mb="20px"
                size="lg"
                fontSize="sm"
                borderRadius="0"
                bg={inputBg}
                borderColor={borderColor}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                isDisabled={loading}
              />

              <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="800" color={textColor} mb="8px">
                Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired
                variant="auth"
                type="email"
                placeholder="Nhập email"
                mb="20px"
                size="lg"
                fontSize="sm"
                borderRadius="0"
                bg={inputBg}
                borderColor={borderColor}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isDisabled={loading}
              />

              <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="800" color={textColor} mb="8px">
                Mật khẩu<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md" mb="20px">
                <Input
                  isRequired
                  fontSize="sm"
                  placeholder="Mật khẩu tối thiểu 8 ký tự"
                  size="lg"
                  type={showPassword ? 'text' : 'password'}
                  variant="auth"
                  borderRadius="0"
                  bg={inputBg}
                  borderColor={borderColor}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isDisabled={loading}
                />
                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: 'pointer' }}
                    as={showPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleShowPassword}
                  />
                </InputRightElement>
              </InputGroup>

              <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="800" color={textColor} mb="8px">
                Xác nhận mật khẩu<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired
                fontSize="sm"
                placeholder="Nhập lại mật khẩu"
                size="lg"
                type={showPassword ? 'text' : 'password'}
                variant="auth"
                borderRadius="0"
                bg={inputBg}
                borderColor={borderColor}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isDisabled={loading}
              />

              <Button
                fontSize="sm"
                bg="#0B0B0B"
                color="white"
                fontWeight="900"
                w="100%"
                h="52px"
                borderRadius="0"
                my="24px"
                onClick={handleEmailPasswordSignUp}
                isLoading={loading}
                loadingText="Đang xử lý..."
                spinner={<Spinner size="sm" />}
                _hover={{ bg: '#F97316' }}
              >
                Đăng ký
              </Button>
            </FormControl>

            <Flex flexDirection="column" justifyContent="center" alignItems="start" maxW="100%" mt="0px">
              <Text color={textColorSecondary} fontWeight="400" fontSize="14px">
                Đã có tài khoản?
                <NavLink to="/auth/sign-in">
                  <Text color={textColorBrand} as="span" ms="5px" fontWeight="800">
                    Đăng nhập
                  </Text>
                </NavLink>
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignUp;
