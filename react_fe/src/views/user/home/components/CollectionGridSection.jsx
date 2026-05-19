import React from 'react';
import { Box, Grid, GridItem, Text, Button, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useCategories } from 'contexts/CategoryContext';

const collectionCards = [
  {
    title: 'Bộ sưu tập Mùa Hè',
    label: 'Xu hướng mới',
    buttonText: 'Khám phá ngay',
    image:
      'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779074288/Category-m-t-shirt-pc_qx9nbv.jpg',
    variant: 'large',
    position: 'center',
    to: '/user/product',
  },
  {
    title: 'Phụ Kiện Nổi Bật',
    subtitle:
      'Tạo điểm nhấn cho phong cách của bạn với đa dạng dòng phụ kiện.',
    image:
      'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779074543/Category-m-accessories-pc_rskt76.jpg',
    variant: 'small',
    position: 'center',
    fallbackTo: '/user/product/phu-kien',
    categoryKeywords: ['phụ kiện', 'phu kien', 'accessories'],
  },
  {
    title: 'Giày Sneakers',
    subtitle:
      'Nâng tầm outfit hằng ngày với những mẫu sneaker năng động, dễ phối.',
    image:
      'https://res.cloudinary.com/dltg0f2qf/image/upload/v1779074730/goods_32_484330_3x4_oqdlmp.avif',
    variant: 'small',
    position: 'center',
    fallbackTo: '/user/product/giay',
    categoryKeywords: ['giay', 'gi�y', 'sneaker'],
  },
];

function CollectionCard({ card, gridProps }) {
  const isLarge = card.variant === 'large';

  return (
    <GridItem
      as={RouterLink}
      to={card.to || card.fallbackTo || '/user/product'}
      position="relative"
      borderRadius={{ base: '22px', md: '28px' }}
      overflow="hidden"
      h={{ base: isLarge ? '360px' : '230px', md: 'auto' }}
      boxShadow="0 16px 38px rgba(15, 23, 42, 0.1)"
      transition="transform 0.35s ease, box-shadow 0.35s ease"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: '0 24px 52px rgba(15, 23, 42, 0.16)',
        '& .collection-image': { transform: 'scale(1.035)' },
        '& .collection-overlay': { opacity: 0.82 },
      }}
      {...gridProps}
    >
      <Box
        className="collection-image"
        position="absolute"
        inset={0}
        backgroundImage={`url('${card.image}')`}
        backgroundSize="cover"
        backgroundPosition={card.position}
        transition="transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)"
        filter="saturate(1.06) contrast(1.03)"
      />

      <Box
        className="collection-overlay"
        position="absolute"
        inset={0}
        opacity={0.72}
        transition="opacity 0.35s ease"
        bg={
          isLarge
            ? 'linear-gradient(0deg, rgba(5,8,14,0.42) 0%, rgba(5,8,14,0.18) 30%, rgba(5,8,14,0) 58%), linear-gradient(90deg, rgba(5,8,14,0.24) 0%, rgba(5,8,14,0.08) 34%, rgba(5,8,14,0) 62%)'
            : 'linear-gradient(0deg, rgba(5,8,14,0.44) 0%, rgba(5,8,14,0.18) 38%, rgba(5,8,14,0) 66%)'
        }
        pointerEvents="none"
      />

      <Flex
        position="relative"
        zIndex={1}
        direction="column"
        justify="flex-end"
        h="100%"
        p={{ base: isLarge ? 5 : 4, md: isLarge ? 7 : 5 }}
        color="white"
      >
        <Box
          maxW={isLarge ? '390px' : '300px'}
          bg="rgba(5, 8, 14, 0.14)"
          border="1px solid rgba(255,255,255,0.12)"
          borderRadius="xl"
          px={{ base: 4, md: isLarge ? 5 : 4 }}
          py={{ base: 3, md: isLarge ? 4 : 3 }}
        >
          {card.label && (
            <Text
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="widest"
              mb={2}
              textTransform="uppercase"
              color="whiteAlpha.900"
              textShadow="0 2px 8px rgba(0,0,0,0.42)"
            >
              {card.label}
            </Text>
          )}

          <Text
            fontSize={
              isLarge
                ? { base: '2xl', md: '3xl' }
                : { base: 'lg', md: 'xl' }
            }
            fontWeight="bold"
            lineHeight="1.18"
            mb={card.subtitle ? 2 : 4}
            textShadow="0 2px 12px rgba(0,0,0,0.45)"
          >
            {card.title}
          </Text>

          {card.subtitle && (
            <Text
              fontSize={{ base: 'sm', md: 'sm' }}
              lineHeight="1.65"
              color="whiteAlpha.900"
              maxW="280px"
              noOfLines={2}
              textShadow="0 2px 10px rgba(0,0,0,0.46)"
            >
              {card.subtitle}
            </Text>
          )}

          {card.buttonText && (
            <Button
              size="sm"
              bg="rgba(255,255,255,0.12)"
              color="white"
              variant="outline"
              borderColor="whiteAlpha.700"
              w="max-content"
              borderRadius="full"
              px={6}
              _hover={{ bg: 'white', color: 'gray.900' }}
            >
              {card.buttonText}
            </Button>
          )}
        </Box>
      </Flex>
    </GridItem>
  );
}

export default function CollectionGridSection() {
  const { categories } = useCategories();
  const cards = collectionCards.map((card) => {
    if (!card.categoryKeywords) return card;

    const matchedCategory = categories.find((category) => {
      const name = `${category.name || ''} ${category.slug || ''}`.toLowerCase();
      return card.categoryKeywords.some((keyword) => name.includes(keyword));
    });

    return {
      ...card,
      to: matchedCategory?.slug
        ? `/user/product/${matchedCategory.slug}`
        : card.fallbackTo,
    };
  });

  return (
    <Box py={10} px={{ base: 4, md: 20 }} maxW="1440px" mx="auto">
      <Text
        fontSize={{ base: '2xl', md: '3xl' }}
        fontWeight="bold"
        mb={8}
        textAlign="center"
        bgGradient="linear(to-r, #7366ff, #d633ff, #ff6a00)"
        bgClip="text"
      >
        Bộ Sưu Tập Nổi Bật
      </Text>

      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
        templateRows={{ base: 'auto', md: 'repeat(2, 280px)' }}
        gap={6}
      >
        <CollectionCard
          card={cards[0]}
          gridProps={{
            colSpan: { base: 1, md: 2 },
            rowSpan: { base: 1, md: 2 },
          }}
        />
        <CollectionCard card={cards[1]} />
        <CollectionCard card={cards[2]} />
      </Grid>
    </Box>
  );
}
