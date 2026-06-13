import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react';
import NewsletterService from 'services/NewsletterService';
import { useAppToast } from 'utils/ToastHelper';
import AppContainer from 'components/ui/AppContainer';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function SubscribeSection() {
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
    <AppContainer pb={{ base: 12, md: 20 }}>
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align={{ base: 'stretch', lg: 'center' }}
        justify="space-between"
        gap={8}
        p={{ base: 6, md: 10 }}
        minH={{ base: 'auto', md: '300px' }}
        borderRadius={{ base: '22px', md: '30px' }}
        bg="#0A0A0A"
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          right="-120px"
          top="-160px"
          w="380px"
          h="380px"
          bg="rgba(249,115,22,0.34)"
          borderRadius="full"
          filter="blur(10px)"
        />
        <Box position="relative" maxW="680px">
          <Text
            fontSize="xs"
            fontWeight="900"
            letterSpacing="0.16em"
            textTransform="uppercase"
            color="#FDBA74"
            mb={4}
          >
            Trendify private list
          </Text>
          <Heading
            fontSize={{ base: '3xl', md: '5xl' }}
            lineHeight="1"
            letterSpacing="-0.035em"
            mb={4}
          >
            Nhận drop mới và ưu đãi trước mọi người.
          </Heading>
          <Text color="whiteAlpha.800" fontSize={{ base: 'md', md: 'lg' }}>
            Đăng ký để nhận mã giảm giá, lookbook theo mùa và gợi ý phối đồ
            được chọn lọc từ Trendify.
          </Text>
        </Box>

        <Box position="relative" w={{ base: '100%', lg: '430px' }}>
          <InputGroup size="lg">
            <Input
              placeholder="Email của bạn"
              bg="white"
              border="0"
              borderRadius="full"
              pr="128px"
              color="#111827"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubscribe();
              }}
              _placeholder={{ color: 'gray.500' }}
              _focus={{ boxShadow: '0 0 0 3px rgba(249,115,22,0.35)' }}
            />
            <InputRightElement width="118px">
              <Button
                h="40px"
                size="sm"
                bg="#F97316"
                color="white"
                rounded="full"
                px={5}
                isLoading={loading}
                _hover={{ bg: '#EA580C' }}
                onClick={handleSubscribe}
              >
                Đăng ký
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
      </Flex>
    </AppContainer>
  );
}
