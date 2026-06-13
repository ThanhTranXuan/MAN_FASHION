import React from 'react';
import { Box, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import FashionButton from './FashionButton';

export default function FashionHero({ image, title, description, primaryText, primaryTo, secondaryText, secondaryTo, align = 'left' }) {
  return (
    <Box position="relative" minH={{ base: '540px', md: '680px' }} overflow="hidden" borderRadius="16px" bgImage={`url("${image}")`} bgSize="cover" bgPosition="center">
      <Box position="absolute" inset={0} bgGradient="linear(to-r, rgba(0,0,0,0.38), transparent 65%)" />
      <Flex position="relative" minH="inherit" align="center" justify={align === 'center' ? 'center' : 'flex-start'} p={{ base: 6, md: 14 }} color="white">
        <Box maxW="560px" textAlign={align}>
          <Heading fontSize={{ base: '4xl', md: '6xl' }} lineHeight="1.05">{title}</Heading>
          {description && <Text mt={4} fontSize={{ base: 'md', md: 'lg' }}>{description}</Text>}
          <HStack mt={7} spacing={3} justify={align === 'center' ? 'center' : 'flex-start'}>
            {primaryText && <FashionButton as={RouterLink} to={primaryTo}>{primaryText}</FashionButton>}
            {secondaryText && <FashionButton as={RouterLink} to={secondaryTo} variant="secondary">{secondaryText}</FashionButton>}
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
}
