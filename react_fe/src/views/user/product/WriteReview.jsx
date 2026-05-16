import React, { useState, useEffect } from 'react';
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
  Select,
  Checkbox,
  Icon,
  IconButton,
  Spinner,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdStar, MdStarOutline } from 'react-icons/md';
import ReviewService from 'services/ReviewService';
import ProductService from 'services/ProductService';
import { useAppToast } from 'utils/ToastHelper';
import { useUser } from 'contexts/UserContext';

export default function WriteReview() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useAppToast();
  const { user } = useUser();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    purchasedSize: '',
    purchasedColor: '',
    nickname: user?.fullName || '',
    gender: 'Khác',
    location: '',
  });

  const bgColor = useColorModeValue('gray.50', 'navy.900');
  const cardBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
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
  }, [productId, navigate]);

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

    setSubmitting(true);
    try {
      await ReviewService.createReview(productId, formData, user?.id);
      toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
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
        {/* Header */}
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

        <Box bg={cardBg} borderRadius="2xl" p={8} boxShadow="sm">
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Rating */}
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

              {/* Title */}
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

              {/* Comment */}
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
                {/* Size */}
                <FormControl>
                  <FormLabel fontWeight="bold">Kích cỡ đã mua</FormLabel>
                  <Input
                    name="purchasedSize"
                    value={formData.purchasedSize}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: M, L, XL"
                    borderRadius="lg"
                  />
                </FormControl>

                {/* Color */}
                <FormControl>
                  <FormLabel fontWeight="bold">Màu sắc đã mua</FormLabel>
                  <Input
                    name="purchasedColor"
                    value={formData.purchasedColor}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Navy, Trắng"
                    borderRadius="lg"
                  />
                </FormControl>
              </SimpleGrid>

              <Divider />

              <Heading size="md" pt={2}>Thông tin cá nhân</Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Nickname */}
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Biệt danh</FormLabel>
                  <Input
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    placeholder="Nhập tên hiển thị"
                    borderRadius="lg"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>Tên này sẽ hiển thị công khai</Text>
                </FormControl>

                {/* Gender */}
                <FormControl>
                  <FormLabel fontWeight="bold">Giới tính</FormLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    borderRadius="lg"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </Select>
                </FormControl>

                {/* Location */}
                <FormControl>
                  <FormLabel fontWeight="bold">Vị trí (Thành phố/Tỉnh)</FormLabel>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Hà Nội"
                    borderRadius="lg"
                  />
                </FormControl>
              </SimpleGrid>

              <Checkbox isRequired colorScheme="brand" pt={4}>
                Tôi đồng ý với các hướng dẫn về đánh giá sản phẩm.
              </Checkbox>

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


