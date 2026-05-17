// src/views/auth/SignIn.jsx
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
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import { HSeparator } from 'components/separator/Separator';
import DefaultAuth from 'layouts/auth/Default';
import illustration from 'assets/img/auth/auth.png';
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import AuthService from 'services/AuthService';
import EmployeeService from 'services/EmployeeService';
import ProfileService from 'services/ProfileService';
import { useUser } from 'contexts/UserContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from 'config/firebaseConfig';

function SignIn() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const textColorDetails = useColorModeValue('navy.700', 'secondaryGray.600');
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('red.500', 'red.400');

  const googleBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.200');
  const googleText = useColorModeValue('navy.700', 'white');
  const googleHover = useColorModeValue(
    { bg: 'gray.200' },
    { bg: 'whiteAlpha.300' },
  );
  const googleActive = useColorModeValue(
    { bg: 'secondaryGray.300' },
    { bg: 'whiteAlpha.200' },
  );

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
      toast.error('Xác nhận email thất bại. Vui lòng thử lại.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Gmail chưa được liên kết với tài khoản nào.');
      return false;
    }

    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự in hoa');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự thường');
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt');
      return false;
    }
    return true;
  };

  const afterLoginCommon = async () => {
    // 🔐 Lấy info nhanh từ token (id, role, exp…)
    const tokenUser = AuthService.getUserFromToken();

    // 🧑‍💻 Luôn gọi /me để lấy full profile
    try {
      const resProfile = await ProfileService.getProfile();
      setUser(resProfile.data.data);
    } catch (e) {
      console.error('❌ Failed to load profile after login:', e);
      // vẫn tiếp tục điều hướng theo role decode được nếu có
    }

    const role = tokenUser?.roleName;
    const redirectTo = location.state?.from || '/';

    if (role === 'EMPLOYEE') {
      // check-in cho nhân viên
      try {
        await EmployeeService.checkIn();
        toast.success('Đăng nhập thành công! Check-in đã được ghi nhận.');
      } catch (e) {
        console.error('❌ Check-in failed:', e);
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
      // BE giờ chỉ trả token, không trả user
      await AuthService.login({ email, password, keepLoggedIn });

      await afterLoginCommon();
    } catch (error) {
      console.error(error);
      toast.error('Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      await AuthService.socialLogin({
        idToken,
        provider: 'google',
        keepLoggedIn,
      });

      await afterLoginCommon();
    } catch (error) {
      console.error(error);
      toast.error('Đăng nhập thất bại');
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
        h="100%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '5vh' }}
        flexDirection="column"
      >
        <Box me="auto">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Trendify | Đăng Nhập
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            Vui lòng nhập địa chỉ email của bạn
          </Text>
        </Box>

        <Flex
          zIndex="2"
          direction="column"
          w={{ base: '100%', md: '420px' }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: 'auto', lg: 'unset' }}
          me="auto"
          mb={{ base: '20px', md: 'auto' }}
        >
          <Button
            fontSize="sm"
            me="0px"
            mb="26px"
            py="15px"
            h="50px"
            borderRadius="16px"
            bg={googleBg}
            color={googleText}
            fontWeight="500"
            _hover={googleHover}
            _active={googleActive}
            _focus={googleActive}
            onClick={handleGoogleLogin}
            isLoading={loading}
            loadingText="Đang xử lý..."
            spinner={<Spinner size="sm" />}
          >
            <Icon as={FcGoogle} w="20px" h="20px" me="10px" />
            Đăng nhập với Google
          </Button>

          <Flex align="center" mb="25px">
            <HSeparator />
            <Text color="gray.400" mx="14px">
              hoặc
            </Text>
            <HSeparator />
          </Flex>

          <FormControl>
            <FormLabel
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isDisabled={loading}
            />

            <FormLabel
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              display="flex"
            >
              Mật khẩu<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size="md">
              <Input
                isRequired
                fontSize="sm"
                placeholder="Mật khẩu của bạn"
                mb="24px"
                size="lg"
                type={show ? 'text' : 'password'}
                variant="auth"
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

            <Flex justifyContent="space-between" align="center" mb="24px">
              <FormControl display="flex" alignItems="center">
                <Checkbox
                  id="remember-login"
                  colorScheme="brandScheme"
                  me="10px"
                  isChecked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  isDisabled={loading}
                />
                <FormLabel
                  htmlFor="remember-login"
                  mb="0"
                  fontWeight="normal"
                  color={textColor}
                  fontSize="sm"
                >
                  Ghi nhớ đăng nhập
                </FormLabel>
              </FormControl>
              <NavLink to="/auth/forgot-password">
                <Text
                  color={textColorBrand}
                  fontSize="sm"
                  w="124px"
                  fontWeight="500"
                >
                  Quên mật khẩu?
                </Text>
              </NavLink>
            </Flex>

            <Button
              fontSize="sm"
              variant="brand"
              fontWeight="500"
              w="100%"
              h="50"
              mb="24px"
              onClick={handleEmailPasswordLogin}
              isLoading={loading}
              loadingText="Đang xử lý..."
              spinner={<Spinner size="sm" />}
            >
              Đăng Nhập
            </Button>
          </FormControl>

          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="start"
            maxW="100%"
            mt="0px"
          >
            <Text color={textColorDetails} fontWeight="400" fontSize="14px">
              Chưa có tài khoản?
              <NavLink to="/auth/sign-up">
                <Text
                  color={textColorBrand}
                  as="span"
                  ms="5px"
                  fontWeight="500"
                >
                  Tạo Tài Khoản
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
