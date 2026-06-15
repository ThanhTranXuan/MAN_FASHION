import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
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
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import DefaultAuth from 'layouts/auth/Default';
import AuthService from 'services/AuthService';
import EmployeeService from 'services/EmployeeService';
import ProfileService from 'services/ProfileService';
import { useUser } from 'contexts/UserContext';
import { useAppToast } from 'utils/ToastHelper';
import { signInWithPopup } from 'firebase/auth';
import { auth, firebaseDebugConfig, googleProvider } from 'config/firebaseConfig';

const authHeroImage =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80';

function SignIn() {
  const textColor = useColorModeValue('#0B0B0B', 'white');
  const textColorSecondary = useColorModeValue('#4B5563', 'gray.300');
  const textColorDetails = useColorModeValue('#374151', 'gray.300');
  const textColorBrand = useColorModeValue('#F97316', '#FDBA74');
  const brandStars = useColorModeValue('red.500', 'red.400');
  const panelBg = useColorModeValue('fashion.pageBg', 'navy.800');
  const inputBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const googleBg = useColorModeValue('white', 'whiteAlpha.200');
  const googleText = useColorModeValue('#111827', 'white');
  const googleHover = useColorModeValue({ bg: '#FFF7ED' }, { bg: 'whiteAlpha.300' });
  const googleActive = useColorModeValue({ bg: '#FED7AA' }, { bg: 'whiteAlpha.200' });

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useAppToast();
  const { setUser } = useUser();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = () => setShow(!show);

  const validateCredentials = () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Vui lòng nhập email và mật khẩu.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ.');
      return false;
    }

    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự in hoa.');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự thường.');
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.');
      return false;
    }
    return true;
  };

  const afterLoginCommon = async () => {
    const tokenUser = AuthService.getUserFromToken();

    try {
      const resProfile = await ProfileService.getProfile();
      setUser(resProfile.data.data);
    } catch (e) {
      console.error('Failed to load profile after login:', e);
    }

    const role = tokenUser?.roleName;
    const redirectTo = location.state?.from || '/';

    if (role === 'EMPLOYEE') {
      try {
        await EmployeeService.checkIn();
        toast.success('Đăng nhập thành công! Check-in đã được ghi nhận.');
      } catch (e) {
        console.error('Check-in failed:', e);
        toast.error('Chưa có dữ liệu người dùng. Vui lòng thử lại.');
      }
      navigate('/admin');
    } else if (role === 'ADMIN') {
      toast.success('Chào mừng quay trở lại, Quản trị viên!');
      navigate('/admin');
    } else {
      toast.success('Đăng nhập thành công!');
      navigate(redirectTo, { replace: true });
    }
  };

  const handleEmailPasswordLogin = async () => {
    if (!validateCredentials()) return;

    try {
      setLoading(true);
      await AuthService.login({ email, password, keepLoggedIn });
      await afterLoginCommon();
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message;
      toast.error(
        message === 'Tài khoản đã ngừng hoạt động.'
          ? message
          : 'Sai email hoặc mật khẩu',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      console.info('Starting Google login with Firebase config:', firebaseDebugConfig);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      console.info('Firebase ID token received:', {
        hasIdToken: Boolean(idToken),
        email: result.user?.email,
        uid: result.user?.uid,
      });

      await AuthService.socialLogin({ idToken, keepLoggedIn });
      await afterLoginCommon();
    } catch (error) {
      console.error('Google login failed:', {
        code: error?.code,
        message: error?.message,
        customData: error?.customData,
        fullError: error,
      });

      const errorCode = error?.code || error?.message || 'unknown';
      toast.error(`Đăng nhập Google thất bại: ${errorCode}`);
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
          maxW="100%"
          bg={panelBg}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 22px 60px rgba(15, 23, 42, 0.14)"
          overflow="hidden"
          mx="auto"
          mb={0}
          minH={{ base: 'auto', lg: '620px' }}
        >
          <Box
            display={{ base: 'none', lg: 'block' }}
            flex="0 0 42%"
            position="relative"
            minH={{ lg: '620px' }}
            bg="#0B0B0B"
            overflow="hidden"
          >
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
              <Text
                fontSize="xs"
                fontWeight="950"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="#FDBA74"
                mb={4}
              >
                Trendify
              </Text>
              <Heading fontSize={{ lg: '4xl', xl: '5xl' }} lineHeight="1" letterSpacing="-0.04em" mb={4}>
                Mặc đẹp bắt đầu từ tài khoản của bạn.
              </Heading>
              <Text color="whiteAlpha.800" lineHeight="1.8">
                Đăng nhập để theo dõi đơn hàng, lưu giỏ hàng và nhận gợi ý phù hợp với phong cách của bạn.
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
                Tài khoản Trendify
              </Text>
              <Heading color={textColor} fontSize={{ base: '3xl', md: '4xl' }} lineHeight="1" letterSpacing="-0.035em" mb={4}>
                Đăng nhập
              </Heading>
              <Text color={textColorSecondary} fontSize="md" lineHeight="1.7">
                Tiếp tục mua sắm, kiểm tra đơn hàng và nhận ưu đãi dành riêng cho bạn.
              </Text>
            </Box>

            <Button
              fontSize="sm"
              me="0px"
              mb="24px"
              py="15px"
              h="52px"
              borderRadius="0"
              bg={googleBg}
              color={googleText}
              border="1px solid"
              borderColor={borderColor}
              fontWeight="800"
              _hover={googleHover}
              _active={googleActive}
              _focus={googleActive}
              onClick={handleGoogleLogin}
              isLoading={loading}
              loadingText="Đang xử lý..."
              spinner={<Spinner size="sm" />}
              w="100%"
            >
              <Icon as={FcGoogle} w="20px" h="20px" me="10px" />
              Đăng nhập với Google
            </Button>

            <Flex align="center" mb="24px" gap={4}>
              <Box h="1px" flex="1" bg="blackAlpha.200" />
              <Text color={textColorSecondary} fontSize="sm" fontWeight="700">
                hoặc đăng nhập bằng email
              </Text>
              <Box h="1px" flex="1" bg="blackAlpha.200" />
            </Flex>

            <FormControl>
              <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="800" color={textColor} mb="8px">
                Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired
                variant="auth"
                fontSize="sm"
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
              />

              <FormLabel ms="4px" fontSize="sm" fontWeight="800" color={textColor} display="flex">
                Mật khẩu<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired
                  fontSize="sm"
                  placeholder="Nhập mật khẩu"
                  mb="24px"
                  size="lg"
                  type={show ? 'text' : 'password'}
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
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>

              <Flex justifyContent="space-between" align="center" mb="24px" gap={4}>
                <FormControl display="flex" alignItems="center">
                  <Checkbox
                    id="remember-login"
                    colorScheme="orange"
                    me="10px"
                    isChecked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    isDisabled={loading}
                  />
                  <FormLabel htmlFor="remember-login" mb="0" fontWeight="normal" color={textColor} fontSize="sm">
                    Ghi nhớ đăng nhập
                  </FormLabel>
                </FormControl>
                <NavLink to="/auth/forgot-password">
                  <Text color={textColorBrand} fontSize="sm" w="124px" fontWeight="800">
                    Quên mật khẩu?
                  </Text>
                </NavLink>
              </Flex>

              <Button
                fontSize="sm"
                bg="#0B0B0B"
                color="white"
                fontWeight="900"
                w="100%"
                h="52px"
                borderRadius="0"
                mb="24px"
                onClick={handleEmailPasswordLogin}
                isLoading={loading}
                loadingText="Đang xử lý..."
                spinner={<Spinner size="sm" />}
                _hover={{ bg: '#F97316' }}
              >
                Đăng nhập
              </Button>
            </FormControl>

            <Flex flexDirection="column" justifyContent="center" alignItems="start" maxW="100%" mt="0px">
              <Text color={textColorDetails} fontWeight="400" fontSize="14px">
                Chưa có tài khoản?
                <NavLink to="/auth/sign-up">
                  <Text color={textColorBrand} as="span" ms="5px" fontWeight="800">
                    Tạo tài khoản
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

export default SignIn;
