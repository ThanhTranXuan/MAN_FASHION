import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  Button,
  useColorModeValue,
  Divider,
  Spinner,
  Container,
  Heading,
  Progress,
  IconButton,
} from '@chakra-ui/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import ReviewService from 'services/ReviewService';
import ProductService from 'services/ProductService';
import ReviewItem, { StarRating } from './components/review/ReviewItem';
import { useUser } from 'contexts/UserContext';
import { useAppToast } from 'utils/ToastHelper';
import { goToSignIn } from 'utils/NavigationHelper';

export default function AllReviews() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useAppToast();
  const { isAuthenticated } = useUser();
  
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const bgColor = useColorModeValue('gray.50', 'navy.900');
  const cardBg = useColorModeValue('white', 'navy.800');

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProduct = async () => {
      try {
        const res = await ProductService.getDetailById(productId);
        setProduct(res.data);
      } catch (err) {
        console.error('Error loading product:', err);
      }
    };
    loadProduct();
  }, [productId]);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const res = await ReviewService.getReviews(productId, page, 10);
        setReviews(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        
        const summaryRes = await ReviewService.getReviewSummary(productId);
        setSummary(summaryRes.data);
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [productId, page]);

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      goToSignIn(
        navigate,
        location,
        toast,
        'Bạn phải đăng nhập để viết đánh giá.',
      );
      return;
    }

    toast.info('Vui lòng mở lịch sử mua hàng và chọn đúng sản phẩm cần đánh giá.');
    navigate('/user/profile');
  };

  if (loading && page === 0) return (
    <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
      <Spinner size="xl" color="brand.500" />
    </Flex>
  );

  return (
    <Box bg={bgColor} minH="100vh" py={10} pt={{ base: '80px', md: '100px' }}>
      <Container maxW="1000px">
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
            <Heading size="lg">{product?.name || 'Đánh giá sản phẩm'}</Heading>
            <Text color="gray.500">Tất cả bài đánh giá</Text>
          </VStack>
        </Flex>

        {/* Summary Card */}
        {summary && (
          <Box bg={cardBg} borderRadius="2xl" p={8} mb={8} boxShadow="sm">
            <Flex direction={{ base: 'column', md: 'row' }} gap={10} align="center">
              {/* Average */}
              <VStack spacing={2} align="center" minW="200px">
                <Text fontSize="5xl" fontWeight="bold">{summary.averageRating.toFixed(1)}</Text>
                <StarRating rating={summary.averageRating} size={6} />
                <Text color="gray.500">{summary.totalReviews} đánh giá</Text>
              </VStack>

              {/* Bars */}
              <Box flex="1" w="100%">
                {[5, 4, 3, 2, 1].map((star) => (
                  <Flex key={star} align="center" mb={2}>
                    <Text w="50px" fontSize="sm" fontWeight="bold">{star} sao</Text>
                    <Box flex="1" mx={4}>
                      <Progress 
                        value={summary.totalReviews > 0 ? (summary.ratingCounts[star] / summary.totalReviews) * 100 : 0} 
                        size="sm" 
                        colorScheme="yellow" 
                        borderRadius="full"
                        bg="gray.100"
                        _dark={{ bg: 'whiteAlpha.100' }}
                      />
                    </Box>
                    <Text w="40px" fontSize="sm" color="gray.500" textAlign="right">
                      {summary.ratingCounts[star]}
                    </Text>
                  </Flex>
                ))}
              </Box>

              {/* Write Review CTA */}
              <VStack spacing={4} minW="200px">
                <Button 
                  colorScheme="brand" 
                  w="100%" 
                  onClick={handleWriteReview}
                >
                  Viết bài đánh giá
                </Button>
              </VStack>
            </Flex>
          </Box>
        )}

        {/* Reviews List */}
        <Box bg={cardBg} borderRadius="2xl" p={8} boxShadow="sm">
          {reviews.length === 0 ? (
            <Text textAlign="center" py={10} color="gray.500">Chưa có đánh giá nào.</Text>
          ) : (
            <VStack align="stretch" divider={<Divider />}>
              {reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </VStack>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center" mt={10} gap={2}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={page === i ? 'solid' : 'outline'}
                  colorScheme="brand"
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </Button>
              ))}
            </Flex>
          )}
        </Box>
      </Container>
    </Box>
  );
}
