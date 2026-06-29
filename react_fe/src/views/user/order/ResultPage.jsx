
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaCheckCircle, FaTimesCircle, FaHome } from 'react-icons/fa';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);


  const bgColor = useColorModeValue('gray.50', 'navy.900');
  const cardBg = useColorModeValue('white', 'navy.800');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const code = searchParams.get('code');
  const cancel = searchParams.get('cancel');

  const isSuccess = code === '00' && cancel !== 'true';

  if (loading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text mt={4} fontSize="lg">Đang xử lý...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={12}>
      <Container maxW="container.md">
        <Box bg={cardBg} p={10} borderRadius="2xl" boxShadow="2xl" textAlign="center">
          {isSuccess ? (
            <>
              <Icon as={FaCheckCircle} boxSize={20} color="green.500" mb={6} />
              <Heading size="2xl" color="green.600" mb={4}>
                Thanh Toán Thành Công!
              </Heading>
              <Text fontSize="lg" color="gray.600" mb={6}>
                Cảm ơn bạn đã mua sắm tại <strong>Trendify</strong>!
                <br />
                Đơn hàng của bạn đã được xác nhận và đang được xử lý.
              </Text>
              <Alert status="success" borderRadius="lg" mb={6}>
                <AlertIcon />
                Chúng tôi đã gửi email xác nhận đến hộp thư của bạn.
              </Alert>
            </>
          ) : (
            <>
              <Icon as={FaTimesCircle} boxSize={20} color="red.500" mb={6} />
              <Heading size="2xl" color="red.600" mb={4}>
                Thanh Toán Bị Hủy
              </Heading>
              <Text fontSize="lg" color="gray.600" mb={6}>
                Bạn đã hủy thanh toán hoặc giao dịch không thành công.
                <br />
                Đơn hàng chưa được xác nhận. Bạn có thể thử lại bất cứ lúc nào.
              </Text>
              <Alert status="warning" borderRadius="lg" mb={6}>
                <AlertIcon />
                Đơn hàng sẽ tự động hủy sau <strong>15 phút</strong> nếu không được thanh toán.
              </Alert>
            </>
          )}

          <VStack spacing={4} mt={8}>
            <Button
              colorScheme="brand"
              size="lg"
              w="full"
              leftIcon={<FaHome />}
              onClick={() => navigate('/user/home')}
            >
              Về Trang Chủ
            </Button>
            <Button
              variant="outline"
              colorScheme="brand"
              size="lg"
              w="full"
              onClick={() => navigate('/user/profile?tab=orders')}
            >
              Xem Đơn Hàng Của Tôi
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
