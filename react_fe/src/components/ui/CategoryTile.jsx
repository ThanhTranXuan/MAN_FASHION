import React from 'react';
import { Box, Image, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export default function CategoryTile({ image, title, to }) {
  return (
    <Box as={RouterLink} to={to} position="relative" overflow="hidden" borderRadius="16px" aspectRatio="3 / 4" _hover={{ '& img': { transform: 'scale(1.03)' } }}>
      <Image src={image} alt={title} w="100%" h="100%" objectFit="cover" transition="transform 0.45s ease" />
      <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(0,0,0,0.42), transparent 52%)" />
      <Text position="absolute" left={5} bottom={5} color="white" fontWeight="800" fontSize="xl">{title}</Text>
    </Box>
  );
}
