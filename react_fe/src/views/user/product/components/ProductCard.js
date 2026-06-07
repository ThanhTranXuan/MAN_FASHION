import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Image,
  Text,
  HStack,
  Tooltip,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { formatUSD } from 'utils/FormatHelper';

export default function ProductCard({ product, onClick, activeColor, variant }) {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'navy.800');
  const bgHover = useColorModeValue('gray.50', 'navy.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const isHomeCard = variant === 'home';
  const averageRating = Number(product.averageRating || 0);
  const reviewCount = Number(product.reviewCount || 0);
  const showRating = reviewCount > 0 && averageRating > 0;
  const price = Number(product.price || 0);
  const salePrice = Number(product.salePrice || 0);
  const hasSale =
    Boolean(product.isSale) && salePrice > 0 && price > 0 && salePrice < price;

  // ✅ Lấy danh sách màu duy nhất từ variants
  const colors = useMemo(() => {
    if (!Array.isArray(product.variants)) return [];
    const colorSet = new Set();
    product.variants.forEach((v) => {
      if (v.color) colorSet.add(v.color.toLowerCase());
    });
    return Array.from(colorSet);
  }, [product.variants]);

  // ✅ State màu đang chọn (ưu tiên color filter từ list page)
  const [selectedColor, setSelectedColor] = useState(activeColor || '');

  // ✅ Ảnh hiển thị: ưu tiên theo selectedColor → thumbnail → ảnh đầu tiên
  const displayImage = useMemo(() => {
    if (selectedColor && Array.isArray(product.images)) {
      const match = product.images.find(
        (img) => img.color?.toLowerCase() === selectedColor.toLowerCase(),
      );
      if (match) return match.url;
    }

    return (
      product.images?.find((i) => i.isThumbnail)?.url ||
      product.images?.[0]?.url ||
      null
    );
  }, [selectedColor, product.images]);

  // ✅ Khi có activeColor mới (từ filter) → cập nhật màu hiển thị
  useEffect(() => {
    if (activeColor) {
      setSelectedColor(activeColor);
    } else if (colors.length > 0 && !selectedColor) {
      setSelectedColor(colors[0]);
    }
  }, [activeColor, colors, selectedColor]);

  return (
    <VStack
      align="stretch"
      spacing={3}
      pb={4}
      h="100%"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      bg={bgColor}
      cursor="pointer"
      onClick={onClick}
      position="relative"
      transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
      _hover={{
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.10)',
        transform: 'translateY(-3px)',
        borderColor: 'brand.100',
        bg: bgHover,
        '& .product-image': {
          transform: 'scale(1.025)',
        },
        '& .home-product-image-overlay': { opacity: 1 },
      }}
      color={textColor}
    >
      {/* 🖼 Image */}
      <Box
        position="relative"
        w="100%"
        pb="130%"
        overflow="hidden"
        borderTopRadius="xl"
        borderBottomRadius={isHomeCard ? 'lg' : '0'}
      >
        {displayImage ? (
          <Image
            className="product-image"
            src={displayImage}
            alt={product.name}
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            objectFit="cover"
            transition="transform 0.35s ease"
          />
        ) : (
          <Flex
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            align="center"
            justify="center"
            color={subTextColor}
            fontSize="sm"
          >
            No image
          </Flex>
        )}
        {isHomeCard && (
          <Box
            className="home-product-image-overlay"
            position="absolute"
            inset={0}
            borderRadius="inherit"
            pointerEvents="none"
            opacity={0}
            transition="opacity 0.25s ease"
            bgGradient="linear(to-b, transparent 62%, rgba(0,0,0,0.10))"
          />
        )}
      </Box>

      {/* 🧾 Info */}
      <VStack px={4} align="start" spacing={2} flex="1">
        <Text
          noOfLines={2}
          minH="48px"
          fontWeight="semibold"
          fontSize="md"
          color={textColor}
        >
          {product.name}
        </Text>

        <VStack align="start" spacing={0} minH="48px">
          <Text fontWeight="bold" fontSize="lg" color="brand.500">
            {formatUSD(hasSale ? salePrice : price)}
          </Text>
          {hasSale && (
            <Text
              fontSize="sm"
              color={subTextColor}
              textDecoration="line-through"
            >
              {formatUSD(price)}
            </Text>
          )}
        </VStack>

        <Box minH="20px">
          {showRating && (
            <HStack spacing={1} color={textColor} fontSize="sm" lineHeight="1">
              <Text as="span" fontWeight="bold">
                ★
              </Text>
              <Text as="span" fontWeight="semibold">
                {averageRating.toFixed(1)}
              </Text>
              <Text as="span" color={subTextColor}>
                ({reviewCount})
              </Text>
            </HStack>
          )}
        </Box>

        {/* 🎨 Colors */}
        <Box minH="32px">
          {colors.length > 0 && (
            <HStack spacing={2} pt={1} flexWrap="wrap">
            {colors.slice(0, 6).map((c) => {
              const isSelected =
                selectedColor?.toLowerCase() === c.toLowerCase();
              return (
                <Tooltip
                  textTransform="capitalize"
                  key={c}
                  label={c}
                  placement="top"
                  hasArrow
                >
                  <Box
                    w="24px"
                    h="24px"
                    borderRadius="full"
                    borderWidth="2px"
                    borderColor={isSelected ? 'brand.400' : 'gray.300'}
                    bg={c === 'navy' ? 'blue.900' : c}
                    cursor="pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(c);
                    }}
                    transition="all 0.2s ease"
                    _hover={{
                      transform: 'scale(1.1)',
                      borderColor: 'brand.400',
                    }}
                  />
                </Tooltip>
              );
            })}
            {colors.length > 6 && (
              <Text fontSize="sm" color={subTextColor}>
                +{colors.length - 6}
              </Text>
            )}
            </HStack>
          )}
        </Box>
      </VStack>
    </VStack>
  );
}
