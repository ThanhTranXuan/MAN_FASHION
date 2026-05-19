import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import AuthService from 'services/AuthService';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';

function ResetPassword() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const toast = useAppToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
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
      toast.error('Mật khẩu không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    try {
      setLoading(true);
      await AuthService.resetPassword(token, password);
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/auth/sign-in');
    } catch (error) {
      console.error(error);
      toast.error('Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.');
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
            Đặt Lại Mật Khẩu
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            Nhập mật khẩu mới của bạn bên dưới.
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
            {/* New Password */}
            <FormLabel
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Mật Khẩu Mới<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size="md">
              <Input
                isRequired
                fontSize="sm"
                placeholder="Tối thiểu 8 ký tự, 1 chữ in hoa, 1 số, 1 ký tự đặc biệt"
                mb="24px"
                size="lg"
                type={showPassword ? 'text' : 'password'}
                variant="auth"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isDisabled={loading}
              />
              <InputRightElement display="flex" alignItems="center" mt="4px">
                <Icon
                  color="gray.400"
                  _hover={{ cursor: 'pointer' }}
                  as={showPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </InputRightElement>
            </InputGroup>

            {/* Confirm Password */}
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
            <InputGroup size="md">
              <Input
                isRequired
                fontSize="sm"
                placeholder="Nhập lại mật khẩu"
                mb="24px"
                size="lg"
                type={showConfirm ? 'text' : 'password'}
                variant="auth"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isDisabled={loading}
              />
              <InputRightElement display="flex" alignItems="center" mt="4px">
                <Icon
                  color="gray.400"
                  _hover={{ cursor: 'pointer' }}
                  as={showConfirm ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={() => setShowConfirm(!showConfirm)}
                />
              </InputRightElement>
            </InputGroup>

            <Button
              fontSize="sm"
              variant="brand"
              fontWeight="500"
              w="100%"
              h="50"
              mb="24px"
              onClick={handleResetPassword}
              isLoading={loading}
              loadingText="Resetting..."
              spinner={<Spinner size="sm" />}
            >
              Đặt Lại Mật Khẩu
            </Button>
          </FormControl>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default ResetPassword;
