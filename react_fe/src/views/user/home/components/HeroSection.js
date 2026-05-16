import { Box, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MotionFlex, MotionText } from './MotionPrimitives';

export default function HeroSection({ textColor }) {
  const navigate = useNavigate();

  return (
    <Box px={{ base: 4, md: 8 }} pb={10}>
      <Box position="relative" w="100%" h={{ base: '400px', md: '550px' }} overflow="hidden" borderRadius="2xl">
        {/* Background Image với Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          backgroundImage="url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80')"
          backgroundSize="cover"
          backgroundPosition="center"
          _after={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            w: '100%',
            h: '100%',
            bg: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)',
          }}
        />

        <MotionFlex
          position="relative"
          zIndex={1}
          direction="column"
          align="flex-start"
          justify="center"
          h="100%"
          px={{ base: 6, md: 16 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box maxW="500px">
            <MotionText
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="bold"
              mb={4}
              color="white"
              lineHeight="1.2"
            >
              Tỏa Sáng Cùng Phong Cách Mùa Hè
            </MotionText>

            <MotionText
              fontSize={{ base: 'md', md: 'lg' }}
              color="gray.200"
              mb={8}
            >
              Cập nhật ngay xu hướng thời trang mùa hè. Những thiết kế hiện đại, chất liệu thoáng mát giúp bạn luôn nổi bật.
            </MotionText>

            <Button
              size="lg"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              rounded="full"
              px={8}
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
