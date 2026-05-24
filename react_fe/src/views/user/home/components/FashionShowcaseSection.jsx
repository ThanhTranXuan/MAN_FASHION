import React from 'react';
import { Box, Flex, Image, Text, useColorModeValue } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

export const fashionSlides = [
  {
    title: 'Phong cách mùa hè',
    subtitle: 'Những thiết kế thoáng nhẹ, dễ phối cho ngày năng động.',
    imageUrl: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779597882/KV-02-pc-summer_qvkhzw.webp',
  },
  {
    title: 'Tối giản mỗi ngày',
    subtitle: 'Các item cơ bản nhưng dễ tạo điểm nhấn.',
    imageUrl: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779597882/KV-03-pc-summer_mu3rov.webp',
  },
  {
    title: 'Phụ kiện hoàn thiện outfit',
    subtitle: 'Tạo điểm nhấn nhỏ nhưng đủ khác biệt.',
    imageUrl: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779597882/KV-06-pc-summer_xffzsn.webp',
  },
  {
    title: 'Ưu đãi theo mùa',
    subtitle: 'Những lựa chọn đáng chú ý cho tủ đồ mới.',
    imageUrl: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779597885/KV-05-pc-summer_kwwh3n.webp',
  },
  {
    title: 'Layer ngày se lạnh',
    subtitle: 'Giữ vẻ gọn gàng với các thiết kế dễ phối.',
    imageUrl: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779597882/KV-07-pc-summer_kbxt7j.webp',
  },
];

export default function FashionShowcaseSection() {
  const textColor = useColorModeValue('white', 'white');

  return (
    <Box px={{ base: 4, md: 20 }} py={{ base: 8, md: 12 }}>
      <Box
        position="relative"
        overflow="hidden"
        borderRadius={{ base: '18px', md: '24px' }}
        boxShadow="sm"
      >
        <Swiper
          modules={[Autoplay]}
          loop={fashionSlides.length > 1}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
        >
          {fashionSlides.map((slide) => (
            <SwiperSlide key={slide.title}>
              <Box
                position="relative"
                h={{ base: '320px', md: '500px', xl: '560px' }}
                overflow="hidden"
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  draggable={false}
                />
                <Box
                  position="absolute"
                  inset={0}
                  bgGradient="linear(to-tr, rgba(0,0,0,0.34), rgba(0,0,0,0.10) 42%, transparent 72%)"
                />
                <Flex
                  position="absolute"
                  inset={0}
                  align="flex-end"
                  px={{ base: 5, md: 12, xl: 16 }}
                  pb={{ base: 8, md: 14 }}
                  pointerEvents="none"
                >
                  <Box maxW={{ base: '88%', md: '500px' }} color={textColor}>
                    <Text
                      fontSize={{ base: '2xl', md: '4xl' }}
                      fontWeight="bold"
                      lineHeight="1.15"
                      mb={3}
                    >
                      {slide.title}
                    </Text>
                    <Text
                      fontSize={{ base: 'sm', md: 'lg' }}
                      lineHeight="1.7"
                      opacity={0.92}
                    >
                      {slide.subtitle}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
}
