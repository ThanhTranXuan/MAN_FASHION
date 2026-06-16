import React from 'react';
import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';
import AppContainer from 'components/ui/AppContainer';

const looks = [
  {
    title: 'Đi làm gọn gàng',
    meta: '01 / ngày thường',
    desc: 'Sơ mi sáng màu, quần đứng phom và sneaker tối giản cho lịch trình bận rộn.',
    imageUrl: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779597882/KV-02-pc-summer_qvkhzw.webp',
    sectionKey: 'daily',
  },
  {
    title: 'Cuối tuần thoải mái',
    meta: '02 / thư giãn',
    desc: 'Chất liệu thoáng, màu trung tính và phom rộng vừa đủ để di chuyển cả ngày.',
    imageUrl: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779597882/KV-03-pc-summer_mu3rov.webp',
    sectionKey: 'relax',
  },
  {
    title: 'Điểm nhấn buổi tối',
    meta: '03 / sau giờ làm',
    desc: 'Layer tối màu cùng phụ kiện nổi bật để tổng thể có chiều sâu hơn.',
    imageUrl: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779597882/KV-06-pc-summer_xffzsn.webp',
    sectionKey: 'after-work',
  },
];

export default function FashionShowcaseSection() {
  const buildProductLink = (look) => {
    return `/user/product?outfit=${encodeURIComponent(look.sectionKey)}`;
  };

  return (
    <Box bg="#F6F0E8" py={{ base: 12, md: 22 }}>
      <AppContainer>
        <Flex direction={{ base: 'column', xl: 'row' }} gap={{ base: 10, xl: 16 }}>
          <Box flex="0 0 34%" position={{ xl: 'sticky' }} top={{ xl: '110px' }} alignSelf="flex-start">
            <Text
              color="#F97316"
              fontSize="xs"
              fontWeight="950"
              letterSpacing="0.18em"
              textTransform="uppercase"
              mb={5}
            >
              Gợi ý phối đồ
            </Text>
            <Heading
              fontSize={{ base: '4xl', md: '7xl' }}
              lineHeight="0.9"
              letterSpacing="-0.06em"
              color="#0B0B0B"
            >
              Ít món hơn. Nhiều khí chất hơn.
            </Heading>
            <Text mt={6} color="#4B5563" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.8">
              Ba hướng phối đồ giúp bạn bắt đầu nhanh: đi làm, đi chơi cuối
              tuần và những buổi hẹn sau giờ làm.
            </Text>
            <Button
              as={RouterLink}
              to="/user/product"
              mt={8}
              rightIcon={<MdArrowForward />}
              bg="#0B0B0B"
              color="white"
              borderRadius="0"
              h="52px"
              px={8}
              _hover={{ bg: '#F97316' }}
            >
              Xem outfit
            </Button>
          </Box>

          <Box flex="1" position="relative">
            {looks.map((look, index) => (
              <Flex
                key={look.title}
                as={RouterLink}
                to={buildProductLink(look)}
                direction={{
                  base: 'column',
                  md: index % 2 === 0 ? 'row' : 'row-reverse',
                }}
                align="stretch"
                gap={{ base: 4, md: 6 }}
                mb={{ base: 8, md: index === 2 ? 0 : 12 }}
                ml={{ base: 0, xl: index === 1 ? 16 : 0 }}
                mr={{ base: 0, xl: index === 0 ? 12 : index === 2 ? 24 : 0 }}
                color="inherit"
                _hover={{ textDecoration: 'none', '& img': { transform: 'scale(1.045)' } }}
              >
                <Box
                  flex={{ base: 'none', md: index === 0 ? '0 0 62%' : '0 0 48%' }}
                  h={{ base: '360px', md: index === 0 ? '520px' : '390px' }}
                  overflow="hidden"
                  bg="#111827"
                >
                  <Image
                    src={look.imageUrl}
                    alt={look.title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    transition="transform 0.65s ease"
                  />
                </Box>
                <Flex
                  flex="1"
                  direction="column"
                  justify="space-between"
                  borderTop="1px solid"
                  borderBottom="1px solid"
                  borderColor="#0B0B0B"
                  py={{ base: 5, md: 6 }}
                  minH={{ base: 'auto', md: '260px' }}
                >
                  <Text fontSize="sm" fontWeight="950" color="#F97316">
                    {look.meta}
                  </Text>
                  <Box>
                    <Text
                      fontSize={{ base: '3xl', md: '5xl' }}
                      fontWeight="950"
                      letterSpacing="-0.055em"
                      lineHeight="0.95"
                      color="#0B0B0B"
                    >
                      {look.title}
                    </Text>
                    <Text mt={4} color="#4B5563">
                      {look.desc}
                    </Text>
                  </Box>
                </Flex>
              </Flex>
            ))}
          </Box>
        </Flex>
      </AppContainer>
    </Box>
  );
}
