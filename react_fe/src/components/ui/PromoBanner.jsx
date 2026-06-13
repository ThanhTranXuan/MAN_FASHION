import React from 'react';
import { Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import FashionButton from './FashionButton';

export default function PromoBanner({ title, description, actionText, actionTo, ...props }) {
  return (
    <Flex bg="brand.100" borderRadius="16px" p={{ base: 6, md: 10 }} align={{ base: 'flex-start', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap={5} {...props}>
      <VStack align="start" spacing={2}><Heading size="lg">{title}</Heading><Text color="fashion.textMuted">{description}</Text></VStack>
      {actionText && <FashionButton as={RouterLink} to={actionTo} variant="dark">{actionText}</FashionButton>}
    </Flex>
  );
}
