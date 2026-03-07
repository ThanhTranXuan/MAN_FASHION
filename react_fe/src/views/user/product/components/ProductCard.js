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

export default function ProductCard({ product, onClick, activeColor }) {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'navy.800');
  const bgHover = useColorModeValue('gray.50', 'navy.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

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
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      bg={bgColor}
      cursor="pointer"
      onClick={onClick}
      position="relative"
      _hover={{
        boxShadow: 'lg',
        transform: 'translateY(-3px)',
        bg: bgHover,
      }}
      transition="all 0.25s ease"
      color={textColor}
    >
      {/* 🖼 Image */}
      <Box
        position="relative"
        w="100%"
        pb="130%"
        overflow="hidden"
        borderTopRadius="xl"
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            objectFit="cover"
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
      </Box>

      {/* 🧾 Info */}
      <VStack px={4} align="start" spacing={2}>
        <Text
          noOfLines={1}
          fontWeight="semibold"
          fontSize="md"
          color={textColor}
        >
          {product.name}
        </Text>

        <Text fontWeight="bold" fontSize="lg" color="brand.500">
          {formatUSD(product.price)}
        </Text>

        {/* 🎨 Colors */}
        {colors.length > 0 && (
          <HStack spacing={2} pt={2} flexWrap="wrap">
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
      </VStack>
    </VStack>
  );
}
