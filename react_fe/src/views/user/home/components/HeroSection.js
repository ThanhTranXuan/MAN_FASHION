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
            minW={0}
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
                Trendify / Hè 2026
              </Text>
              <Heading
                as="h1"
                fontSize={{ base: '50px', sm: '60px', md: '82px', lg: '102px', xl: '118px', '2xl': '130px' }}
                lineHeight={{ base: '1.12', md: '1.08', xl: '1.06' }}
                fontWeight="950"
                letterSpacing={{ base: '-0.015em', md: '-0.025em', xl: '-0.035em' }}
                color="#0B0B0B"
                textTransform="uppercase"
                maxW={{ base: '100%', lg: '620px', xl: '720px' }}
                mb={{ base: 2, md: 3 }}
                sx={{ textWrap: 'balance' }}
              >
                Mặc
                <br />
                chất
                <br />
                phố
              </Heading>
              <Text
                mt={{ base: 7, md: 9 }}
                maxW="560px"
                fontSize={{ base: 'md', md: 'xl' }}
                color="#374151"
                lineHeight="1.75"
              >
                Chọn nhanh những thiết kế gọn phom, dễ phối và đủ thoải mái
                cho nhịp sống mỗi ngày.
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
                Khám phá ngay
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
              <Image src={heroImages[0]} alt="Bộ sưu tập Trendify hè 2026" w="100%" h="100%" objectFit="cover" />
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
              <Image src={heroImages[1]} alt="Trang phục mùa hè" w="100%" h="100%" objectFit="cover" />
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
                500+ mẫu
                <br />
                dễ phối
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
              <Image src={heroImages[2]} alt="Chi tiết trang phục" w="100%" h="100%" objectFit="cover" />
            </Box>
          </Box>
        </Flex>
      </AppContainer>
    </Box>
  );
}
