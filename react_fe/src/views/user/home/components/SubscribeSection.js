import { useState } from 'react';
import {
  Box,
  Text,
  InputGroup,
  Input,
  InputRightElement,
  Button,
} from '@chakra-ui/react';
import NewsletterService from 'services/NewsletterService';
import { useAppToast } from 'utils/ToastHelper';
import { MotionText } from './MotionPrimitives';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function SubscribeSection({ bgColor, textColor }) {
  const toast = useAppToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const res = await NewsletterService.subscribe(trimmedEmail);
      toast.success(res?.message || 'Email ưu đãi đã được gửi');
      setEmail('');
    } catch (err) {
      const message = err.response?.data?.message;
      if (message === 'EMAIL_INVALID') {
        toast.error('Email không hợp lệ');
      } else {
        toast.error(message || 'Không thể đăng ký nhận bản tin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      textAlign="center"
      px={{ base: 6, md: 20 }}
      py={10}
      bg={bgColor}
      borderRadius="2xl"
    >
      <MotionText
        fontSize={{ base: '2xl', md: '4xl' }}
        fontWeight="bold"
        mb={4}
        bgGradient="linear(to-r, #7366ff, #d633ff, #ff6a00)"
        bgClip="text"
      >
        Tham Gia Cộng Đồng Trendify
      </MotionText>
      <Text fontSize="lg" color={textColor} mb={6}>
        Đăng ký nhận ưu đãi độc quyền, xu hướng thời trang và bộ sưu tập mới nhất từ Trendify.
      </Text>
      <Box maxW="500px" mx="auto">
        <InputGroup size="lg" borderColor={textColor}>
          <Input
            placeholder="Nhập email của bạn"
            bg="whiteAlpha.200"
            borderRadius="full"
            pr="120px"
            color={textColor}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubscribe();
            }}
          />
          <InputRightElement width="100px">
            <Button
              h="full"
              size="md"
              color="white"
              colorScheme="brand"
              rounded="full"
              isLoading={loading}
              onClick={handleSubscribe}
            >
              Đăng Ký
            </Button>
          </InputRightElement>
        </InputGroup>
      </Box>
    </Box>
  );
}
