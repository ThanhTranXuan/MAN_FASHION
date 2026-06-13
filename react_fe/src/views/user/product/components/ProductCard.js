import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  HStack,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import PriceText from 'components/ui/PriceText';
import ProductImage, { getProductImage } from 'components/ui/ProductImage';

export default function ProductCard({
  product,
  onClick,
  activeColor,
  variant = 'grid',
  showQuickAction = true,
  showBadge = true,
}) {
  const textColor = useColorModeValue('fashion.textMain', 'white');
  const mutedColor = useColorModeValue('fashion.textMuted', 'gray.400');
  const price = Number(product?.price || 0);
  const salePrice = Number(product?.salePrice || 0);
  const hasSale = Boolean(product?.isSale) && salePrice > 0 && salePrice < price;
  const rating = Number(product?.averageRating || 0);
  const reviewCount = Number(product?.reviewCount || 0);

  const colors = useMemo(
    () => [
      ...new Set(
        (Array.isArray(product?.variants) ? product.variants : [])
          .map((item) => item.color?.toLowerCase())
          .filter(Boolean),
      ),
    ],
    [product?.variants],
  );
  const [selectedColor, setSelectedColor] = useState(activeColor || colors[0] || '');

  useEffect(() => {
    setSelectedColor(activeColor || colors[0] || '');
  }, [activeColor, colors]);

  const image = useMemo(
    () => getProductImage(product, selectedColor),
    [product, selectedColor],
  );
  const badge = hasSale
    ? { label: 'Sale', bg: 'sale.500' }
    : product?.isNew
      ? { label: 'Mới', bg: '#050505' }
      : product?.isBestSeller
        ? { label: 'Bán chạy', bg: 'brand.500' }
        : null;

  return (
    <VStack
      align="stretch"
      spacing={0}
      h="100%"
      cursor="pointer"
      onClick={onClick}
      transition="transform 0.25s ease"
      _hover={{
        transform: 'translateY(-4px)',
        '& .product-image': { transform: 'scale(1.03)' },
        '& .quick-action': { opacity: 1, transform: 'translateY(0)' },
      }}
    >
      <Box position="relative" aspectRatio="3 / 4" overflow="hidden" borderRadius="16px" bg="fashion.softSurface">
        <ProductImage
          className="product-image"
          product={product}
          color={selectedColor}
          src={image}
          w="100%"
          h="100%"
          transition="transform 0.4s ease"
        />
        {showBadge && badge && (
          <Badge
            position="absolute"
            top={3}
            left={3}
            bg={badge.bg}
            color="white"
            borderRadius="8px"
            px={2.5}
            py={1.5}
          >
            {badge.label}
          </Badge>
        )}
        {showQuickAction && (
          <Button
            className="quick-action"
            display={{ base: 'none', md: 'inline-flex' }}
            position="absolute"
            left={4}
            right={4}
            bottom={4}
            bg="white"
            color="fashion.textMain"
            opacity={0}
            transform="translateY(8px)"
            transition="all 0.25s ease"
            _hover={{ bg: '#050505', color: 'white' }}
            onClick={(event) => {
              event.stopPropagation();
              onClick?.();
            }}
          >
            Xem chi tiết
          </Button>
        )}
      </Box>

      <VStack pt={3} align="start" spacing={1.5} flex="1">
        <Text
          noOfLines={2}
          minH={variant === 'compact' ? 'auto' : '44px'}
          fontWeight="700"
          fontSize={{ base: 'sm', md: 'md' }}
          color={textColor}
        >
          {product?.name}
        </Text>
        <PriceText price={price} salePrice={salePrice} isSale={hasSale} size="md" />

        {reviewCount > 0 && rating > 0 && (
          <HStack spacing={1} fontSize="xs">
            <Text color="brand.500">★</Text>
            <Text fontWeight="700">{rating.toFixed(1)}</Text>
            <Text color={mutedColor}>({reviewCount})</Text>
          </HStack>
        )}

        {colors.length > 0 && (
          <HStack spacing={1.5} pt={1} flexWrap="wrap">
            {colors.slice(0, 5).map((color) => {
              const selected = selectedColor === color;
              return (
                <Tooltip key={color} label={color} textTransform="capitalize" hasArrow>
                  <Box
                    w="18px"
                    h="18px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={selected ? 'brand.500' : 'fashion.borderLight'}
                    bg={color === 'navy' ? 'blue.900' : color}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedColor(color);
                    }}
                  />
                </Tooltip>
              );
            })}
            {colors.length > 5 && <Text fontSize="xs" color={mutedColor}>+{colors.length - 5}</Text>}
          </HStack>
        )}
      </VStack>
    </VStack>
  );
}
