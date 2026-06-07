import { Box, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MotionFlex, MotionText } from './MotionPrimitives';

export default function HeroSection({ textColor }) {
  const navigate = useNavigate();

  return (
    <Box px={{ base: 4, md: 8 }} pb={{ base: 8, md: 10 }}>
      <Box
        position="relative"
        w="100%"
        h={{ base: '400px', md: '520px' }}
        overflow="hidden"
        borderRadius={{ base: '16px', md: '20px' }}
        boxShadow="0 14px 38px rgba(15, 23, 42, 0.12)"
      >
        <Box
          position="absolute"
          inset={0}
          backgroundImage="url('https://res.cloudinary.com/dltg0f2qf/image/upload/v1779074288/Category-m-hero-pc_ssfeei.jpg')"
          backgroundSize="cover"
          backgroundPosition={{ base: '58% center', md: 'center' }}
          filter="saturate(1.05) contrast(1.02)"
        />

        <Box
          position="absolute"
          inset={0}
          bg={{
            base: 'linear-gradient(180deg, rgba(5,8,14,0.02) 0%, rgba(5,8,14,0.08) 48%, rgba(5,8,14,0.28) 100%)',
            md: 'linear-gradient(90deg, rgba(5,8,14,0.26) 0%, rgba(5,8,14,0.16) 28%, rgba(5,8,14,0.04) 58%, rgba(5,8,14,0) 100%)',
          }}
          pointerEvents="none"
        />

        <MotionFlex
          position="relative"
          zIndex={1}
          direction="column"
          align="flex-start"
          justify={{ base: 'flex-end', md: 'center' }}
          h="100%"
          px={{ base: 5, md: 16 }}
          py={{ base: 7, md: 0 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box
            maxW={{ base: '100%', md: '430px' }}
            p={{ base: 4, md: 5 }}
            borderRadius="lg"
            bg="rgba(8, 12, 20, 0.22)"
            border="1px solid rgba(255,255,255,0.14)"
            boxShadow="0 8px 24px rgba(0,0,0,0.10)"
          >
            <MotionText
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="bold"
              mb={3}
              color="white"
              lineHeight="1.18"
              textShadow="0 2px 12px rgba(0,0,0,0.42)"
            >
              Tỏa Sáng Cùng Phong Cách Mùa Hè
            </MotionText>

            <MotionText
              fontSize={{ base: 'sm', md: 'md' }}
              color="whiteAlpha.900"
              mb={5}
              lineHeight="1.6"
              noOfLines={{ base: 3, md: 3 }}
              textShadow="0 2px 10px rgba(0,0,0,0.44)"
            >
              Cập nhật ngay xu hướng thời trang mùa hè. Những thiết kế hiện đại,
              chất liệu thoáng mát giúp bạn luôn nổi bật.
            </MotionText>

            <Button
              size="md"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              rounded="full"
              px={7}
              boxShadow="0 6px 16px rgba(115,102,255,0.20)"
              onClick={() => navigate('/user/product')}
            >
              Mua Sắm Ngay
            </Button>
          </Box>
        </MotionFlex>
      </Box>
    </Box>
  );
}
