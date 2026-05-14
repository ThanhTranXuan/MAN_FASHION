import { Box, Text } from '@chakra-ui/react';
import { MotionText } from './MotionPrimitives';

export default function AboutSection({ textColor }) {
  return (
    <Box px={{ base: 6, md: 20 }} py={10} textAlign="center" color="white">
      <MotionText
        fontSize={{ base: '2xl', md: '4xl' }}
        fontWeight="bold"
        mb={4}
        bgGradient="linear(to-r, #7366ff, #d633ff, #ff6a00)"
        bgClip="text"
      >
        Tại sao chọn Trendify?
      </MotionText>
      <Text fontSize="lg" color={textColor} maxW="700px" mx="auto">
        Trendify mang đến cho bạn trải nghiệm mua sắm trực tuyến tuyệt vời nhất – từ
        quần áo, phụ kiện đến các bài viết phong cách sống. Chúng tôi giúp bạn định hình phong cách
        độc đáo của riêng mình.
      </Text>
    </Box>
  );
}
