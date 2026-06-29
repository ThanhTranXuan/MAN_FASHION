import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Icon,
  IconButton,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MdArrowBack, MdStar, MdStarOutline } from 'react-icons/md';
import ReviewService from 'services/ReviewService';
import ProductService from 'services/ProductService';
import { useAppToast } from 'utils/ToastHelper';
import { useUser } from 'contexts/UserContext';
import { goToSignIn } from 'utils/NavigationHelper';

export default function WriteReview() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useAppToast();
  const { isAuthenticated, loadingUser } = useUser();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    purchasedSize: '',
    purchasedColor: '',
    orderItemId: null,
  });

  const bgColor = useColorModeValue('fashion.pageBg', 'navy.900');
  const cardBg = useColorModeValue('fashion.softSurface', 'navy.800');
  const borderColor = useColorModeValue('fashion.stone', 'navy.700');
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  useEffect(() => {
    if (loadingUser || isAuthenticated) return;

    goToSignIn(
      navigate,
      location,
      toast,
      'Bạn phải đăng nhập để viết đánh giá.',
    );
  }, [isAuthenticated, loadingUser, location, navigate, toast]);

  useEffect(() => {
    if (loadingUser || !isAuthenticated) return;

    window.scrollTo(0, 0);
    const loadProduct = async () => {
      try {
        const res = await ProductService.getDetailById(productId);
        setProduct(res.data);
      } catch (err) {
        console.error('Error loading product:', err);
        toast.error('Không tìm thấy sản phẩm');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId, navigate, loadingUser, isAuthenticated, toast]);

  useEffect(() => {
    const purchasedSize = queryParams.get('size') || '';
    const purchasedColor = queryParams.get('color') || '';
    const orderItemId = Number(queryParams.get('orderItemId'));

    setFormData((prev) => ({
      ...prev,
      purchasedSize,
      purchasedColor,
      orderItemId: Number.isInteger(orderItemId) && orderItemId > 0 ? orderItemId : null,
    }));
  }, [queryParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setRating = (r) => {
    setFormData((prev) => ({ ...prev, rating: r }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.comment.length < 50) {
      return toast.warning('Bình luận phải có ít nhất 50 ký tự.');
    }
    if (!formData.title) {
      return toast.warning('Vui lòng nhập tiêu đề bài đánh giá.');
    }
    if (!formData.orderItemId) {
      return toast.warning('Không xác định được sản phẩm trong đơn hàng đã mua.');
    }

    setSubmitting(true);
    try {
      await ReviewService.createReview(productId, {
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        orderItemId: formData.orderItemId,
      });
      toast.success('Đánh giá của bạn đã được gửi và đang chờ duyệt.');
      navigate(`/user/product/${productId}/reviews`);
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
      <Spinner size="xl" color="brand.500" />
    </Flex>
  );

  return (
    <Box bg={bgColor} minH="100vh" py={10} pt={{ base: '80px', md: '100px' }}>
      <Container maxW="800px">
        {}
        <Flex align="center" mb={8}>
          <IconButton
            icon={<MdArrowBack />}
            onClick={() => navigate(-1)}
            variant="ghost"
            mr={4}
            aria-label="Back"
          />
          <VStack align="start" spacing={0}>
            <Heading size="lg">Viết bài đánh giá</Heading>
            <Text color="gray.500">{product?.name}</Text>
          </VStack>
        </Flex>

        <Box
          bg={cardBg}
          borderRadius="2xl"
          p={8}
          boxShadow="0 18px 42px rgba(120, 53, 15, 0.10)"
          border="1px solid"
          borderColor={borderColor}
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {}
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Xếp hạng</FormLabel>
                <HStack spacing={1}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Icon
                      key={i}
                      as={i <= formData.rating ? MdStar : MdStarOutline}
                      color={i <= formData.rating ? 'yellow.400' : 'gray.300'}
                      boxSize={8}
                      cursor="pointer"
                      onClick={() => setRating(i)}
                    />
                  ))}
                  <Text ml={4} fontWeight="bold" color="gray.500">
                    {formData.rating}/5 sao
                  </Text>
                </HStack>
              </FormControl>

              {}
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Tiêu đề bài đánh giá</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Áo rất đẹp, chất vải mát"
                  borderRadius="lg"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>Tóm tắt điểm chính trong đánh giá của bạn</Text>
              </FormControl>

              {}
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Bình luận của bạn</FormLabel>
                <Textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (tối thiểu 50 ký tự)"
                  borderRadius="lg"
                  rows={6}
                />
                <Text fontSize="xs" color={formData.comment.length < 50 ? 'red.400' : 'gray.500'} mt={1}>
                  {formData.comment.length}/1000 ký tự (Yêu cầu ít nhất 50 ký tự)
                </Text>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel fontWeight="bold">Kích cỡ đã mua</FormLabel>
                  <Input
                    value={formData.purchasedSize}
                    placeholder="Không có thông tin kích cỡ"
                    borderRadius="lg"
                    isReadOnly
                    bg="gray.50"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold">Màu sắc đã mua</FormLabel>
                  <Input
                    value={formData.purchasedColor}
                    placeholder="Không có thông tin màu sắc"
                    borderRadius="lg"
                    isReadOnly
                    bg="gray.50"
                  />
                </FormControl>
              </SimpleGrid>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                h="56px"
                borderRadius="full"
                isLoading={submitting}
                loadingText="Đang gửi..."
                mt={4}
              >
                GỬI BÀI ĐÁNH GIÁ
              </Button>
            </VStack>
          </form>
        </Box>
      </Container>
    </Box>
  );
}
