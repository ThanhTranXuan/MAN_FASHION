import React, { useMemo } from 'react';
import {
  Badge,
  Box,
  Center,
  Flex,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import Card from 'components/card/Card';

const formatNumber = (value) => Math.round(Number(value || 0)).toLocaleString('vi-VN');

export default function ProductCategorySummaryChart({ categories = [] }) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const rowBg = useColorModeValue('white', 'whiteAlpha.100');
  const badgeBg = useColorModeValue('brand.50', 'whiteAlpha.200');
  const badgeColor = useColorModeValue('brand.600', 'white');

  const { items, totalProducts, totalStock } = useMemo(() => {
    const normalizedItems = [...categories]
      .map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName || 'Chưa phân loại',
        productCount: Number(item.productCount || 0),
        totalStock: Number(item.totalStock || 0),
      }))
      .sort((a, b) => b.productCount - a.productCount || b.totalStock - a.totalStock);

    return {
      items: normalizedItems,
      totalProducts: normalizedItems.reduce((sum, item) => sum + item.productCount, 0),
      totalStock: normalizedItems.reduce((sum, item) => sum + item.totalStock, 0),
    };
  }, [categories]);

  if (!categories.length) {
    return (
      <Card justify="center" align="center" h="100%" minH="360px">
        <Center py={8}>
          <Text color="gray.500">Chưa có dữ liệu danh mục</Text>
        </Center>
      </Card>
    );
  }

  return (
    <Card w="100%" h="100%" p="20px">
      <Text color={textColor} fontSize="xl" fontWeight="700" mb="4px">
        Tồn kho theo danh mục
      </Text>
      <Text color={textColorSecondary} fontSize="sm" mb="16px">
        {formatNumber(totalProducts)} sản phẩm trong kho, tổng tồn kho {formatNumber(totalStock)}
      </Text>

      <VStack align="stretch" spacing={3}>
        {items.map((item) => (
          <Flex
            key={item.categoryId ?? item.categoryName}
            align="center"
            justify="space-between"
            gap={4}
            bg={rowBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
            px={4}
            py={3}
          >
            <Box minW={0}>
              <Text color={textColor} fontWeight="700" noOfLines={1}>
                {item.categoryName}
              </Text>
              <Text color={textColorSecondary} fontSize="sm">
                Tổng tồn kho: {formatNumber(item.totalStock)}
              </Text>
            </Box>

            <Badge
              flexShrink={0}
              bg={badgeBg}
              color={badgeColor}
              borderRadius="8px"
              px={3}
              py={1}
              fontSize="sm"
              fontWeight="700"
            >
              {formatNumber(item.productCount)} sản phẩm
            </Badge>
          </Flex>
        ))}
      </VStack>
    </Card>
  );
}
