import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
} from '@chakra-ui/react';
import { MdArrowForward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { MotionFlex } from './MotionPrimitives';
import AppContainer from 'components/ui/AppContainer';

const heroImages = [
  'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779074288/Category-m-hero-pc_ssfeei.jpg',
  'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779597882/KV-02-pc-summer_qvkhzw.webp',
  'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779074288/Category-m-t-shirt-pc_qx9nbv.jpg',
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <Box position="relative" overflow="hidden" bg="#F6F0E8">
      <Box
        position="absolute"
        top={{ base: '80px', md: '120px' }}
        left="0"
        right="0"
        h="1px"
        bg="#111827"
        opacity={0.16}
      />
      <AppContainer pt={{ base: 8, md: 14 }} pb={{ base: 12, md: 20 }}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="stretch"
          gap={{ base: 9, lg: 12 }}
          minH={{ base: 'auto', lg: '720px' }}
        >
          <MotionFlex
            flex="1"
            direction="column"
            justify="space-between"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Box>
              <Text
                fontSize="xs"
                fontWeight="900"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="#F97316"
                mb={{ base: 5, md: 7 }}
              >
                Trendify / Summer 2026
              </Text>
              <Heading
                as="h1"
                fontSize={{ base: '58px', md: '104px', xl: '138px' }}
                lineHeight="0.82"
                fontWeight="950"
                letterSpacing="-0.07em"
                color="#0B0B0B"
                textTransform="uppercase"
              >
                Wear
                <br />
                the
                <br />
                city
              </Heading>
              <Text
                mt={{ base: 6, md: 8 }}
                maxW="560px"
                fontSize={{ base: 'md', md: 'xl' }}
                color="#374151"
                lineHeight="1.75"
              >
                Trang chủ mới đi theo hướng tạp chí thời trang: chữ lớn, nhịp
                ảnh lệch, khoảng trắng rõ và các điểm nhấn đủ mạnh để người xem
                dừng lại.
              </Text>
            </Box>

            <HStack mt={9} spacing={3} flexWrap="wrap">
              <Button
                size="lg"
                bg="#0B0B0B"
                color="white"
                rightIcon={<MdArrowForward />}
                borderRadius="0"
                px={8}
                h="54px"
                _hover={{ bg: '#F97316' }}
                onClick={() => navigate('/user/product')}
              >
                Mua ngay
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="#0B0B0B"
                borderColor="#0B0B0B"
                borderRadius="0"
                px={8}
                h="54px"
                _hover={{ bg: '#0B0B0B', color: 'white' }}
                onClick={() => navigate('/user/blog')}
              >
                Xem lookbook
              </Button>
            </HStack>
          </MotionFlex>

          <Box
            flex="1"
            position="relative"
            minH={{ base: '620px', md: '760px', lg: 'auto' }}
          >
            <Box
              position="absolute"
              top={{ base: '0', lg: '36px' }}
              right={{ base: '0', lg: '20px' }}
              w={{ base: '82%', md: '70%', lg: '72%' }}
              h={{ base: '420px', md: '540px', lg: '610px' }}
              overflow="hidden"
              bg="#111827"
            >
              <Image src={heroImages[0]} alt="Trendify hero" w="100%" h="100%" objectFit="cover" />
            </Box>
            <Box
              position="absolute"
              left={{ base: '0', lg: '10px' }}
              bottom={{ base: '70px', lg: '42px' }}
              w={{ base: '58%', md: '42%', lg: '48%' }}
              h={{ base: '240px', md: '300px', lg: '340px' }}
              overflow="hidden"
              border="10px solid #F6F0E8"
              bg="#111827"
            >
              <Image src={heroImages[1]} alt="Summer outfit" w="100%" h="100%" objectFit="cover" />
            </Box>
            <Flex
              position="absolute"
              right={{ base: '6px', md: '32px' }}
              bottom={{ base: '0', lg: '0' }}
              w={{ base: '190px', md: '230px' }}
              h={{ base: '190px', md: '230px' }}
              align="center"
              justify="center"
              borderRadius="full"
              bg="#F97316"
              color="white"
              textAlign="center"
              p={8}
              transform="rotate(-9deg)"
            >
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="950" lineHeight="1">
                500+ items
                <br />
                easy to style
              </Text>
            </Flex>
            <Box
              display={{ base: 'none', md: 'block' }}
              position="absolute"
              left="24%"
              top="58%"
              w="150px"
              h="210px"
              overflow="hidden"
              border="8px solid #F6F0E8"
              transform="rotate(4deg)"
            >
              <Image src={heroImages[2]} alt="Detail outfit" w="100%" h="100%" objectFit="cover" />
            </Box>
          </Box>
        </Flex>
      </AppContainer>
    </Box>
  );
}
