import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Button, Divider, Spinner, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import ReviewService from 'services/ReviewService';
import ReviewItem from './ReviewItem';

export default function ReviewSection({ productId, slug }) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    
    const load = async () => {
      setLoading(true);
      try {
        const latestRes = await ReviewService.getLatestReviews(productId, 3);
        setReviews(latestRes.data.data || []);
        
        const summaryRes = await ReviewService.getReviewSummary(productId);
        setTotalReviews(summaryRes.data.data.totalReviews || 0);
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [productId]);

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
        <Box py={10} textAlign="center" bg="gray.50" borderRadius="lg" _dark={{ bg: 'whiteAlpha.50' }}>
          <Text color="gray.500">Chưa có đánh giá nào cho sản phẩm này.</Text>
          <Button 
            mt={4} 
            colorScheme="brand" 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/user/product/${productId}/reviews/new`)}
          >
            Viết bài đánh giá đầu tiên
          </Button>
        </Box>
      ) : (
        <Box bg="white" borderRadius="2xl" p={6} boxShadow="sm" _dark={{ bg: 'navy.800' }}>
          <VStack align="stretch" divider={<Divider />}>
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
