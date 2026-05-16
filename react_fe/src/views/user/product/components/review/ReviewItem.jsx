import React from 'react';
import { Box, Flex, Text, HStack, Icon, Avatar, Divider, Button, VStack } from '@chakra-ui/react';
import { MdStar, MdStarHalf, MdStarOutline } from 'react-icons/md';

export const StarRating = ({ rating, size = 4 }) => {
  return (
    <HStack spacing={0.5}>
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= rating) return <Icon key={i} as={MdStar} color="yellow.400" boxSize={size} />;
        if (i - 0.5 <= rating) return <Icon key={i} as={MdStarHalf} color="yellow.400" boxSize={size} />;
        return <Icon key={i} as={MdStarOutline} color="gray.300" boxSize={size} />;
      })}
    </HStack>
  );
};

export default function ReviewItem({ review }) {
  return (
    <Box py={5}>
      <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
        {/* User Info */}
        <Box w={{ base: '100%', md: '200px' }}>
          <HStack mb={2}>
            <Avatar size="sm" name={review.userFullName} src={review.userAvatarUrl} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="sm">{review.nickname || review.userFullName || 'Khách hàng'}</Text>
              <Text fontSize="xs" color="gray.500">{review.gender} {review.location ? `• ${review.location}` : ''}</Text>
            </VStack>
          </HStack>
          <Text fontSize="xs" color="gray.400" mt={1}>
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
          </Text>
        </Box>

        {/* Review Content */}
        <Box flex="1">
          <HStack mb={2} spacing={3}>
            <StarRating rating={review.rating} />
            <Text fontWeight="bold" fontSize="md">{review.title}</Text>
          </HStack>

          <Text fontSize="sm" color="gray.600" mb={3} lineHeight="tall">
            {review.comment}
          </Text>

          {(review.purchasedSize || review.purchasedColor) && (
            <HStack fontSize="xs" color="gray.500" spacing={4}>
              {review.purchasedSize && (
                <Text>Kích cỡ đã mua: <b>{review.purchasedSize}</b></Text>
              )}
              {review.purchasedColor && (
                <Text>Màu sắc đã mua: <b>{review.purchasedColor}</b></Text>
              )}
            </HStack>
          )}
        </Box>
      </Flex>
    </Box>
  );
}


