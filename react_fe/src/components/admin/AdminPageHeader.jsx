import React from 'react';
import { Flex, Heading, Text, VStack } from '@chakra-ui/react';

export default function AdminPageHeader({ title, description, action }) {
  return (
    <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="fashion.textMain">{title}</Heading>
        {description && <Text color="fashion.textMuted">{description}</Text>}
      </VStack>
      {action}
    </Flex>
  );
}
