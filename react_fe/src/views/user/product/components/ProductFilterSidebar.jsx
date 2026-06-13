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
} from '@chakra-ui/react';

const colors = ['black', 'white', 'beige', 'brown', 'gray', 'blue', 'red', 'green'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

export default function ProductFilterSidebar({ categories, categorySlug, color, sizes: selectedSizes, onCategory, onColor, onSizes }) {
  const parents = categories.filter((category) => !category.parentId);
  return (
    <Box
      display={{ base: 'none', lg: 'block' }}
      w="270px"
      flexShrink={0}
      position="sticky"
      top="96px"
      alignSelf="flex-start"
      bg="white"
      border="1px solid"
      borderColor="fashion.borderLight"
      borderRadius="16px"
      p={5}
    >
      <Text fontWeight="800" fontSize="lg">Bộ lọc</Text>
      <Divider my={4} />
      <VStack align="stretch" spacing={2}>
        <Text fontWeight="700" mb={1}>Danh mục</Text>
        <Text cursor="pointer" color={!categorySlug ? 'brand.500' : 'fashion.textMuted'} onClick={() => onCategory('')}>Tất cả sản phẩm</Text>
        {parents.map((category) => (
          <Text key={category.id} cursor="pointer" color={category.slug === categorySlug ? 'brand.500' : 'fashion.textMuted'} onClick={() => onCategory(category.slug)}>
            {category.name}
          </Text>
        ))}
      </VStack>
      <Divider my={5} />
      <Text fontWeight="700" mb={3}>Màu sắc</Text>
      <Wrap spacing={2}>
        {colors.map((item) => (
          <WrapItem key={item}>
            <Box
              w="26px"
              h="26px"
              borderRadius="full"
              bg={item}
              border="2px solid"
              borderColor={color === item ? 'brand.500' : 'fashion.borderLight'}
              cursor="pointer"
              onClick={() => onColor(color === item ? '' : item)}
            />
          </WrapItem>
        ))}
      </Wrap>
      <Divider my={5} />
      <Text fontWeight="700" mb={3}>Kích cỡ</Text>
      <CheckboxGroup value={selectedSizes} onChange={onSizes}>
        <Stack spacing={2}>
          {sizes.map((size) => <Checkbox key={size} value={size}>{size}</Checkbox>)}
        </Stack>
      </CheckboxGroup>
    </Box>
  );
}
