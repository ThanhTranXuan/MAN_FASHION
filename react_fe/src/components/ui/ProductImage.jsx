import React from 'react';
import { Flex, Icon, Image, Text } from '@chakra-ui/react';
import { MdImageNotSupported } from 'react-icons/md';

export function getProductImage(product, color) {
  const images = Array.isArray(product?.images) ? product.images : [];
  return (
    (color && images.find((image) => image.color?.toLowerCase() === color.toLowerCase())?.url) ||
    images.find((image) => image.isThumbnail)?.url ||
    images[0]?.url ||
    ''
  );
}

export default function ProductImage({ product, color, src, alt, ...props }) {
  const imageUrl = src || getProductImage(product, color);
  if (!imageUrl) {
    return (
      <Flex direction="column" align="center" justify="center" bg="fashion.softSurface" color="fashion.textSoft" {...props}>
        <Icon as={MdImageNotSupported} boxSize={8} />
        <Text mt={2} fontSize="sm">Chưa có ảnh</Text>
      </Flex>
    );
  }
  return <Image src={imageUrl} alt={alt || product?.name || 'Sản phẩm'} objectFit="cover" {...props} />;
}
