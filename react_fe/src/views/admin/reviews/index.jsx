import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorModeValue,
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
  const headerBg = useColorModeValue('gray.100', 'navy.800');
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

        <Box minH="560px" overflowX="auto" p={3} position="relative">
          {loading && (
            <Flex position="absolute" top="0" left="0" w="100%" h="100%" align="center" justify="center" zIndex="1" backdropFilter="blur(2px)">
              <Spinner size="xl" thickness="4px" color="brand.500" />
            </Flex>
          )}
          <Table variant="simple" opacity={loading ? 0.6 : 1}>
            <Thead bg={headerBg}>
              <Tr>
                <Th borderColor={borderColor}>Sản phẩm</Th>
                <Th borderColor={borderColor}>Đánh giá</Th>
                <Th borderColor={borderColor}>Người gửi</Th>
                <Th borderColor={borderColor}>Trạng thái</Th>
                <Th borderColor={borderColor}>Phản hồi</Th>
                <Th borderColor={borderColor} textAlign="right">Thao tác</Th>
              </Tr>
            </Thead>
            <Tbody>
              {!loading && reviews.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={8}>
                    <Text color="gray.500">Chưa có đánh giá nào.</Text>
                  </Td>
                </Tr>
              ) : (
                reviews.map((review) => (
                  <Tr key={review.id}>
                    <Td borderColor={borderColor} minW="180px">
                      <Text fontWeight="700">{review.productName || '-'}</Text>
                      <Text fontSize="xs" color="gray.500">ID: {review.productId}</Text>
                    </Td>
                    <Td borderColor={borderColor} minW="260px">
                      <Text fontWeight="700">{review.rating}/5 - {review.title}</Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={3}>{review.comment}</Text>
                      {review.verifiedPurchase && <Badge mt={2} colorScheme="green">Đã mua hàng</Badge>}
                    </Td>
                    <Td borderColor={borderColor} minW="160px">
                      <Text fontWeight="600">{review.nickname || review.userFullName || 'Khách hàng'}</Text>
                      <Text fontSize="xs" color="gray.500">{review.location || '-'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>{renderStatus(review.status)}</Td>
                    <Td borderColor={borderColor} minW="240px">
                      <Textarea
                        size="sm"
                        rows={3}
                        value={replyDrafts[review.id] || ''}
                        onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                        placeholder="Nhập phản hồi từ shop"
                      />
                      <Button mt={2} size="xs" colorScheme="brand" onClick={() => runAction(() => ReviewService.replyReview(review.id, replyDrafts[review.id]), 'Đã lưu phản hồi')}>
                        Lưu phản hồi
                      </Button>
                    </Td>
                    <Td borderColor={borderColor} textAlign="right" minW="220px">
                      <HStack justify="flex-end" spacing={2}>
                        <Button size="xs" colorScheme="green" variant="outline" onClick={() => runAction(() => ReviewService.approveReview(review.id), 'Đã duyệt đánh giá')}>Duyệt</Button>
                        <Button size="xs" colorScheme="red" variant="outline" onClick={() => runAction(() => ReviewService.rejectReview(review.id), 'Đã từ chối đánh giá')}>Từ chối</Button>
                        <Button size="xs" colorScheme="gray" variant="outline" onClick={() => runAction(() => ReviewService.deleteReview(review.id), 'Đã xóa đánh giá')}>Xóa</Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </Box>
  );
}
