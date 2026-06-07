import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  HStack,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import Pagination from 'components/pagination/Pagination';
import ReviewService from 'services/ReviewService';
import { useAppToast } from 'utils/ToastHelper';

const STATUS_META = {
  PENDING: { label: 'Chờ duyệt', color: 'yellow' },
  APPROVED: { label: 'Đã duyệt', color: 'green' },
  REJECTED: { label: 'Từ chối', color: 'red' },
};

export default function AdminReviews() {
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const toast = useAppToast();

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ReviewService.getAdminReviews({
        page,
        size: 10,
        sort: 'createdAt,desc',
        status: statusFilter || undefined,
        rating: ratingFilter || undefined,
      });
      const content = res.data.content || [];
      setReviews(content);
      setTotalPages(res.data.totalPages || 1);
      setReplyDrafts(
        content.reduce((acc, review) => {
          acc[review.id] = review.adminReply || '';
          return acc;
        }, {}),
      );
    } catch (err) {
      console.error(err);
      toast.error('Tải danh sách đánh giá thất bại');
    } finally {
      setLoading(false);
    }
  }, [page, ratingFilter, statusFilter, toast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const runAction = async (action, successMessage) => {
    try {
      await action();
      toast.success(successMessage);
      loadReviews();
    } catch (err) {
      console.error(err);
      toast.error('Thao tác thất bại');
    }
  };

  const renderStatus = (status) => {
    const meta = STATUS_META[status] || { label: status || '-', color: 'gray' };
    return <Badge colorScheme={meta.color}>{meta.label}</Badge>;
  };

  return (
    <Box>
      <Card flexDirection="column" w="100%" borderRadius="16px" boxShadow="md" bg={cardBg}>
        <Flex px="25px" py="12px" justify="space-between" gap={3} flexWrap="wrap">
          <Text fontSize="22px" fontWeight="700">Quản lý đánh giá</Text>
          <HStack spacing={3}>
            <Select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }} w="180px">
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
            </Select>
            <Select value={ratingFilter} onChange={(e) => { setPage(0); setRatingFilter(e.target.value); }} w="140px">
              <option value="">Tất cả sao</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating} sao</option>
              ))}
            </Select>
          </HStack>
        </Flex>

        <Box minH={{ base: '360px', md: '520px' }} p={{ base: 3, md: 5 }} position="relative">
          {loading && (
            <Flex position="absolute" top="0" left="0" w="100%" h="100%" align="center" justify="center" zIndex="1" backdropFilter="blur(2px)">
              <Spinner size="xl" thickness="4px" color="brand.500" />
            </Flex>
          )}
          {!loading && reviews.length === 0 ? (
            <Flex minH="420px" align="center" justify="center">
              <Text color="gray.500">Chưa có đánh giá nào.</Text>
            </Flex>
          ) : (
            <VStack spacing={4} align="stretch" opacity={loading ? 0.6 : 1}>
              {reviews.map((review) => (
                <Box
                  key={review.id}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="14px"
                  p={{ base: 4, md: 5 }}
                  bg={cardBg}
                >
                  <Flex
                    justify="space-between"
                    align={{ base: 'flex-start', md: 'center' }}
                    gap={3}
                    direction={{ base: 'column', md: 'row' }}
                  >
                    <Box>
                      <Text fontWeight="700">{review.productName || '-'}</Text>
                      <Text fontSize="xs" color="gray.500">
                        Sản phẩm #{review.productId}
                      </Text>
                    </Box>
                    <HStack spacing={2} flexWrap="wrap">
                      <Badge colorScheme="yellow">{review.rating}/5 sao</Badge>
                      {renderStatus(review.status)}
                      {review.verifiedPurchase && (
                        <Badge colorScheme="green">Đã mua hàng</Badge>
                      )}
                    </HStack>
                  </Flex>

                  <Divider my={4} />

                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                    <Box>
                      <Text fontWeight="700" mb={1}>
                        {review.title || 'Đánh giá sản phẩm'}
                      </Text>
                      <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
                        {review.comment || '-'}
                      </Text>
                      <Text mt={3} fontSize="sm" fontWeight="600">
                        {review.nickname ||
                          review.userFullName ||
                          'Khách hàng'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {review.location || 'Không có vị trí'}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="600" mb={2}>
                        Phản hồi từ shop
                      </Text>
                      <Textarea
                        size="sm"
                        rows={3}
                        value={replyDrafts[review.id] || ''}
                        onChange={(event) =>
                          setReplyDrafts((previous) => ({
                            ...previous,
                            [review.id]: event.target.value,
                          }))
                        }
                        placeholder="Nhập phản hồi từ shop"
                      />
                      <Button
                        mt={2}
                        size="sm"
                        colorScheme="brand"
                        onClick={() =>
                          runAction(
                            () =>
                              ReviewService.replyReview(
                                review.id,
                                replyDrafts[review.id],
                              ),
                            'Đã lưu phản hồi',
                          )
                        }
                      >
                        Lưu phản hồi
                      </Button>
                    </Box>
                  </SimpleGrid>

                  <Divider my={4} />

                  <Flex justify="flex-end" gap={2} flexWrap="wrap">
                    <Button
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() =>
                        runAction(
                          () => ReviewService.approveReview(review.id),
                          'Đã duyệt đánh giá',
                        )
                      }
                    >
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() =>
                        runAction(
                          () => ReviewService.rejectReview(review.id),
                          'Đã từ chối đánh giá',
                        )
                      }
                    >
                      Từ chối
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="gray"
                      variant="outline"
                      onClick={() =>
                        runAction(
                          () => ReviewService.deleteReview(review.id),
                          'Đã xóa đánh giá',
                        )
                      }
                    >
                      Xóa
                    </Button>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Card>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </Box>
  );
}
