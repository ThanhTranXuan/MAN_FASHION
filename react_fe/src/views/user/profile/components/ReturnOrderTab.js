import React from 'react';
import {
  Box,
  Heading,
  VStack,
  Flex,
  Image,
  Text,
  Divider,
  Spinner,
  Tag,
  TagLabel,
  useColorModeValue,
} from '@chakra-ui/react';
import { formatCurrencyVND } from 'utils/FormatHelper';
import StatusBadge from 'components/ui/StatusBadge';
import EmptyState from 'components/ui/EmptyState';

export default function ReturnOrderTab({
  returns,
  isLoading,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}) {
  const cardBg = useColorModeValue('fashion.softSurface', 'navy.800');
  const borderColor = useColorModeValue('fashion.stone', 'navy.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const handleScroll = (e) => {
    if (!onLoadMore || !hasMore || loadingMore || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 80) {
      onLoadMore();
    }
  };

  if (isLoading && !returns.length) {
    return (
      <Flex direction="column" align="center" py={12}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!returns.length) {
    return (
      <EmptyState title="Chưa có yêu cầu hoàn trả" description="Yêu cầu hoàn trả của bạn sẽ xuất hiện tại đây." />
    );
  }

  return (
    <Box>
      <Heading size="md" mb={6} color={textColor}>
        Đơn Hoàn Trả
      </Heading>

      <Box
        maxH="500px"
        overflowY="auto"
        onScroll={handleScroll}
        pr={2}
      >
        <VStack align="stretch" spacing={6}>
          {returns.map((ro) => (
            <Box
              key={ro.id}
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="12px"
              p={5}
              boxShadow="0 6px 20px rgba(15, 23, 42, 0.05)"
            >
              {/* Header */}
              <Flex justify="space-between" align="center" mb={4}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    Hoàn Trả #{ro.returnCode || 'Yêu Cầu Hoàn Trả'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Đơn Hàng #{ro.orderCode}
                  </Text>
                </Box>
                <StatusBadge status={ro.status} px={3} py={1} />
              </Flex>

              {/* Items */}
              <VStack spacing={3} align="stretch" divider={<Divider />}>
                {ro.items?.map((item) => (
                  <Flex
                    key={item.orderItemId}
                    align="center"
                    justify="space-between"
                    gap={4}
                    flexWrap="wrap"
                  >
                    <Flex align="center" gap={3} flex="1">
                      {item.thumbnailUrl && (
                        <Image
                          src={item.thumbnailUrl}
                          boxSize="60px"
                          borderRadius="8px"
                          objectFit="cover"
                        />
                      )}
                      <Box>
                        <Text fontWeight="semibold">
                          {item.productName || 'Sản phẩm'}
                        </Text>

                        {(item.color || item.size) && (
                          <Tag
                            size="sm"
                            variant="subtle"
                            borderRadius="full"
                            mt={1}
                            bg="fashion.pageBg"
                          >
                            <TagLabel textTransform="capitalize">
                              {`${item.color || ''}${
                                item.color && item.size ? ' / ' : ''
                              }${item.size || ''}`}
                            </TagLabel>
                          </Tag>
                        )}
                      </Box>
                    </Flex>

                    <Box textAlign="right">
                      <Text fontWeight="semibold">
                        {formatCurrencyVND(item.unitPrice * item.quantity)}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Số lượng: {item.quantity}
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </VStack>

              <Divider my={3} />

              <Text fontSize="sm" color="gray.600">
                Lý do: {ro.reason}
              </Text>
              {ro.note && (
                <Text fontSize="sm" color="gray.500">
                  Ghi chú: {ro.note}
                </Text>
              )}
              {ro.status === 'REJECTED' && ro.rejectReason && (
                <Text fontSize="sm" color="red.500" mt={2}>
                  Lý do từ chối: {ro.rejectReason}
                </Text>
              )}
              {ro.processedAt && (
                <Text fontSize="xs" color="gray.400" mt={1}>
                  Xử lý lúc: {new Date(ro.processedAt).toLocaleString('vi-VN')}
                </Text>
              )}
            </Box>
          ))}
        </VStack>

        {loadingMore && (
          <Flex justify="center" py={4}>
            <Spinner size="md" />
          </Flex>
        )}

        {!loadingMore && !hasMore && (
          <Flex justify="center" py={4}>
            <Text fontSize="sm" color="gray.400">
              Đã xem hết lịch sử đơn hoàn trả.
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
}
