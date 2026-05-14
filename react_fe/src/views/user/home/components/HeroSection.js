import { Box, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Welcome from 'assets/img/home/welcome.png';
import { MotionFlex, MotionText, MotionImage } from './MotionPrimitives';

export default function HeroSection({ textColor }) {
  const navigate = useNavigate();

  return (
    <MotionFlex
      direction={{ base: 'column', md: 'row' }}
      align="center"
      justify="space-between"
      gap={{ base: 10, md: 20 }}
      px={{ base: 6, md: 20 }}
      py={10}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Box flex={1} maxW="500px" color="white">
        <MotionText
          fontSize={{ base: '3xl', md: '5xl' }}
          fontWeight="bold"
          mb={4}
          bgGradient="linear(to-r, #4facfe, #7366ff, #d633ff, #ff6a00)"
          bgClip="text"
        >
          Chào mừng đến với <span>Trendify</span>
        </MotionText>

        <MotionText
          fontSize={{ base: 'md', md: 'lg' }}
          color={textColor}
          mb={6}
        >
          Khám phá xu hướng thời trang mới nhất, những ưu đãi độc quyền và phụ kiện độc đáo định hình phong cách của bạn.
        </MotionText>

        {/* ✅ Nút điều hướng */}
        <Button
          size="lg"
          color="white"
          colorScheme="brand"
          rounded="full"
          onClick={() => navigate('/user/product')}
        >
          Mua Sắm Ngay
        </Button>
      </Box>

      <Box width="400px" textAlign="center">
        <MotionImage
          src={Welcome}
          alt="Welcome"
          borderRadius="2xl"
          objectFit="contain"
          w="100%"
          h="300px"
        />
      </Box>
    </MotionFlex>
  );
}
