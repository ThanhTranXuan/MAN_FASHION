import React from 'react';
import {
  Box,
  Checkbox,
  CheckboxGroup,
  Divider,
  Text,
  VStack,
  Wrap,
  WrapItem,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';

export default function ProductFilterSidebar({ categories, categorySlug, filterOptions, color, sizes: selectedSizes, onCategory, onColor, onSizes }) {
  const parents = categories.filter((category) => !category.parentId);
  const availableColors = filterOptions?.colors?.length ? filterOptions.colors : [];
  const availableSizes = filterOptions?.sizes?.length ? filterOptions.sizes : [];
  const bg = useColorModeValue('#FFFDF8', 'navy.800');
  const borderColor = useColorModeValue('#D8C7B3', 'navy.700');
  const headingColor = useColorModeValue('fashion.textMain', 'white');
  const mutedColor = useColorModeValue('#5F5142', 'gray.300');
  return (
    <Box
      display={{ base: 'none', lg: 'block' }}
      w="270px"
      flexShrink={0}
      position="sticky"
      top="96px"
      alignSelf="flex-start"
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="16px"
      p={5}
      boxShadow="0 18px 42px rgba(120, 53, 15, 0.10)"
      maxH="calc(100vh - 120px)"
      overflowY="auto"
      sx={{
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(180, 83, 9, 0.35)',
          borderRadius: '999px',
        },
      }}
    >
      <Text fontWeight="800" fontSize="lg" color={headingColor}>Bộ lọc</Text>
      <Divider my={4} borderColor={borderColor} />
      <VStack align="stretch" spacing={2}>
        <Text fontWeight="700" mb={1} color={headingColor}>Danh mục</Text>
        <Text cursor="pointer" color={!categorySlug ? 'brand.500' : mutedColor} onClick={() => onCategory('')}>Tất cả sản phẩm</Text>
        {parents.map((category) => (
          <Text key={category.id} cursor="pointer" color={category.slug === categorySlug ? 'brand.500' : mutedColor} onClick={() => onCategory(category.slug)}>
            {category.name}
          </Text>
        ))}
      </VStack>
      <Divider my={5} borderColor={borderColor} />
      <Text fontWeight="700" mb={3} color={headingColor}>Màu sắc</Text>
      <Wrap spacing={2}>
        {availableColors.map((item) => (
          <WrapItem key={item}>
            <Box
              w="26px"
              h="26px"
              borderRadius="full"
              bg={item}
              border="2px solid"
              borderColor={color === item ? 'brand.500' : borderColor}
              cursor="pointer"
              onClick={() => onColor(color === item ? '' : item)}
            />
          </WrapItem>
        ))}
      </Wrap>
      <Divider my={5} borderColor={borderColor} />
      <Text fontWeight="700" mb={3} color={headingColor}>Kích cỡ</Text>
      <CheckboxGroup value={selectedSizes} onChange={onSizes}>
        <Stack spacing={2}>
          {availableSizes.map((size) => <Checkbox key={size} value={size}>{size}</Checkbox>)}
        </Stack>
      </CheckboxGroup>
    </Box>
  );
}
