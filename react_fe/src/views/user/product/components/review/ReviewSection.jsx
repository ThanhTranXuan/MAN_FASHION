import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Button, Divider, Spinner, VStack, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReviewService from 'services/ReviewService';
import ReviewItem from './ReviewItem';
import { useUser } from 'contexts/UserContext';
import { useAppToast } from 'utils/ToastHelper';
import { goToSignIn } from 'utils/NavigationHelper';

export default function ReviewSection({ productId, slug }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useAppToast();
  const { isAuthenticated } = useUser();
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const surfaceBg = useColorModeValue('fashion.softSurface', 'navy.800');
  const emptyBg = useColorModeValue('fashion.softSurface', 'whiteAlpha.50');
  const borderColor = useColorModeValue('fashion.stone', 'navy.700');

  useEffect(() => {
    if (!productId) return;
    
    const load = async () => {
      setLoading(true);
      try {
        const latestRes = await ReviewService.getLatestReviews(productId, 3);
        setReviews(latestRes.data || []);
        
        const summaryRes = await ReviewService.getReviewSummary(productId);
        setTotalReviews(summaryRes.data.totalReviews || 0);
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [productId]);

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

  if (loading) return (
    <Box mt={10} textAlign="center">
      <Spinner />
    </Box>
  );

  return (
    <Box mt={16} mb={10}>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="xl" fontWeight="bold">Đánh giá</Text>
        {totalReviews > 0 && (
          <Button 
            variant="link" 
            colorScheme="brand" 
            size="sm"
            onClick={() => navigate(`/user/product/${productId}/reviews`)}
          >
            Xem tất cả đánh giá ({totalReviews})
          </Button>
        )}
      </Flex>

      {reviews.length === 0 ? (
        <Box py={10} textAlign="center" bg={emptyBg} border="1px solid" borderColor={borderColor} borderRadius="lg">
          <Text color="gray.500">Chưa có đánh giá nào cho sản phẩm này.</Text>
          <Button 
            mt={4} 
            colorScheme="brand" 
            variant="outline" 
            size="sm"
            onClick={handleWriteReview}
          >
            Viết bài đánh giá đầu tiên
          </Button>
        </Box>
      ) : (
        <Box bg={surfaceBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={6} boxShadow="sm">
          <VStack align="stretch" divider={<Divider borderColor={borderColor} />}>
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </VStack>
          
          {totalReviews > 3 && (
            <Flex justify="flex-end" mt={4}>
              <Button 
                variant="link" 
                colorScheme="brand" 
                size="sm"
                onClick={() => navigate(`/user/product/${productId}/reviews`)}
              >
                Xem thêm
              </Button>
            </Flex>
          )}
        </Box>
      )}
    </Box>
  );
}
