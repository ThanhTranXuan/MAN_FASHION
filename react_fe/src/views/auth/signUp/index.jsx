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
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import DefaultAuth from 'layouts/auth/Default';
import illustration from 'assets/img/auth/auth.png';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import AuthService from 'services/AuthService';

function SignUp() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('red.500', 'red.400');

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

    // 🔒 Rule 1: Độ dài tối thiểu
    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    // 🔒 Rule 2: Ít nhất 1 chữ in hoa
    if (!/[A-Z]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự in hoa');
      return;
    }

    // 🔒 Rule 3: Ít nhất 1 chữ in thường
    if (!/[a-z]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự thường');
      return;
    }

    // 🔒 Rule 4: Ít nhất 1 ký tự đặc biệt
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt');
      return;
    }

    // 🔒 Rule 5: Mật khẩu khớp nhau
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
      toast.error('Đăng ký thất bại. Vui lòng thử lại.');
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
            Đăng Ký
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            Tạo Tài Khoản Mới để bắt đầu!
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
          <FormControl>
            <FormLabel
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Họ Tên Đầy Đủ<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              isRequired
              variant="auth"
              type="text"
              placeholder="Nhập họ tên"
              mb="24px"
              size="lg"
              fontSize="sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              isDisabled={loading}
            />

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
              type="email"
              placeholder="Nhập email"
              mb="24px"
              size="lg"
              fontSize="sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isDisabled={loading}
            />

            <FormLabel
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Mật Khẩu<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size="md" mb="24px">
              <Input
                isRequired
                fontSize="sm"
                placeholder="Mật khẩu tối thiểu 8 ký tự"
                size="lg"
                type={showPassword ? 'text' : 'password'}
                variant="auth"
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

            <FormLabel
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Xác Nhận Mật Khẩu<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              isRequired
              fontSize="sm"
              placeholder="Nhập lại mật khẩu"
              size="lg"
              type={showPassword ? 'text' : 'password'}
              variant="auth"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isDisabled={loading}
            />

            <Button
              fontSize="sm"
              variant="brand"
              fontWeight="500"
              w="100%"
              h="50"
              my="24px"
              onClick={handleEmailPasswordSignUp}
              isLoading={loading}
              loadingText="Đang xử lý..."
              spinner={<Spinner size="sm" />}
            >
              Đăng Ký
            </Button>
          </FormControl>

          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="start"
            maxW="100%"
            mt="0px"
          >
            <Text color={textColorSecondary} fontWeight="400" fontSize="14px">
              Đã có tài khoản?
              <NavLink to="/auth/sign-in">
                <Text
                  color={textColorBrand}
                  as="span"
                  ms="5px"
                  fontWeight="500"
                >
                  Đăng nhập
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignUp;
