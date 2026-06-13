import React, { useMemo } from 'react';
import { Box, Flex, Grid, Heading, Image, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { MdArrowOutward } from 'react-icons/md';
import { useCategories } from 'contexts/CategoryContext';
import AppContainer from 'components/ui/AppContainer';

const categoryCards = [
  {
    title: 'Áo',
    label: '01',
    keywords: ['ao', 'áo', 'shirt'],
    image: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779074288/Category-m-t-shirt-pc_qx9nbv.jpg',
    grid: { mdCol: 'span 5', mdRow: 'span 2' },
  },
  {
    title: 'Quần',
    label: '02',
    keywords: ['quan', 'quần', 'pants'],
    image: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779597882/KV-03-pc-summer_mu3rov.webp',
    grid: { mdCol: 'span 3', mdRow: 'span 1' },
  },
  {
    title: 'Giày',
    label: '03',
    keywords: ['giay', 'giày', 'shoe'],
    image: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779074730/goods_32_484330_3x4_oqdlmp.avif',
    grid: { mdCol: 'span 4', mdRow: 'span 1' },
  },
  {
    title: 'Phụ kiện',
    label: '04',
    keywords: ['phu kien', 'phụ kiện', 'accessories'],
    image: 'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779074543/Category-m-accessories-pc_rskt76.jpg',
    grid: { mdCol: 'span 7', mdRow: 'span 1' },
  },
];

export default function CollectionGridSection() {
  const { categories } = useCategories();
  const cards = useMemo(
    () =>
      categoryCards.map((card) => {
        const category = categories.find((item) => {
          const searchable = `${item.name || ''} ${item.slug || ''}`.toLowerCase();
          return card.keywords.some((keyword) => searchable.includes(keyword));
        });
        return {
          ...card,
          to: category?.slug ? `/user/product/${category.slug}` : '/user/product',
        };
      }),
    [categories],
  );

  return (
    <Box bg="#0B0B0B" color="white" py={{ base: 12, md: 20 }}>
      <AppContainer>
        <Flex
          align={{ base: 'flex-start', lg: 'flex-end' }}
          justify="space-between"
          direction={{ base: 'column', lg: 'row' }}
          gap={6}
          mb={{ base: 8, md: 12 }}
        >
          <Box>
            <Text
              color="#F97316"
              fontSize="xs"
              fontWeight="950"
              letterSpacing="0.18em"
              textTransform="uppercase"
              mb={4}
            >
              Category bento
            </Text>
            <Heading
              fontSize={{ base: '4xl', md: '7xl' }}
              lineHeight="0.92"
              letterSpacing="-0.055em"
              maxW="820px"
            >
              Không cần xem hết, chỉ cần chọn đúng mood.
            </Heading>
          </Box>
          <Text maxW="360px" color="whiteAlpha.700">
            Mỗi nhóm sản phẩm có nhịp riêng: ô lớn để tạo lực thị giác, ô nhỏ
            để lướt nhanh, không còn cảm giác copy cùng một card.
          </Text>
        </Flex>

        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(12, 1fr)' }}
          autoRows={{ base: '340px', md: '260px' }}
          gap={{ base: 4, md: 5 }}
        >
          {cards.map((card) => (
            <Box
              key={card.title}
              as={RouterLink}
              to={card.to}
              position="relative"
              overflow="hidden"
              gridColumn={{ base: 'auto', md: card.grid.mdCol }}
              gridRow={{ base: 'auto', md: card.grid.mdRow }}
              bg="#111827"
              _hover={{
                '& img': { transform: 'scale(1.06)' },
                '& .category-title': { letterSpacing: '-0.02em' },
                '& .category-icon': { bg: '#F97316', color: 'white' },
              }}
            >
              <Image
                src={card.image}
                alt={card.title}
                w="100%"
                h="100%"
                objectFit="cover"
                transition="transform 0.7s ease"
              />
              <Box
                position="absolute"
                inset={0}
                bg="linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.78))"
              />
              <Text
                position="absolute"
                top={5}
                left={5}
                fontSize="sm"
                fontWeight="950"
                color="whiteAlpha.800"
              >
                {card.label}
              </Text>
              <Flex
                className="category-icon"
                position="absolute"
                top={4}
                right={4}
                w="46px"
                h="46px"
                align="center"
                justify="center"
                bg="white"
                color="#0B0B0B"
                transition="all 0.25s ease"
              >
                <MdArrowOutward size={22} />
              </Flex>
              <Text
                className="category-title"
                position="absolute"
                left={5}
                bottom={5}
                fontSize={{ base: '48px', md: card.grid.mdRow === 'span 2' ? '82px' : '54px' }}
                fontWeight="950"
                lineHeight="0.85"
                letterSpacing="-0.08em"
                transition="letter-spacing 0.25s ease"
              >
                {card.title}
              </Text>
            </Box>
          ))}
        </Grid>
      </AppContainer>
    </Box>
  );
}
