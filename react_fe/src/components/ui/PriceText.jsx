import React from 'react';
import { HStack, Text } from '@chakra-ui/react';
import { formatCurrencyVND } from 'utils/FormatHelper';

export default function PriceText({
  value,
  price,
  salePrice,
  isSale,
  size = 'md',
  ...props
}) {
  const originalPrice = Number(price ?? value ?? 0);
  const discountedPrice = Number(salePrice || 0);
  const hasSale = Boolean(isSale) && discountedPrice > 0 && discountedPrice < originalPrice;
  const fontSize = { sm: 'sm', md: 'md', lg: 'xl' }[size] || size;

  return (
    <HStack spacing={2} flexWrap="wrap" {...props}>
      <Text fontWeight="800" fontSize={fontSize} color={hasSale ? 'sale.500' : 'fashion.textMain'}>
        {formatCurrencyVND(hasSale ? discountedPrice : originalPrice)}
      </Text>
      {hasSale && (
        <Text fontSize="sm" color="fashion.textSoft" textDecoration="line-through">
          {formatCurrencyVND(originalPrice)}
        </Text>
      )}
    </HStack>
  );
}
