import React from 'react';
import { Flex, Heading, Text, VStack } from '@chakra-ui/react';

export default function SectionHeader({ eyebrow, title, description, action, ...props }) {
  return (
    <Flex
      align={{ base: 'flex-start', md: 'flex-end' }}
      justify="space-between"
      direction={{ base: 'column', md: 'row' }}
      gap={4}
      {...props}
    >
      <VStack align="start" spacing={1}>
        {eyebrow && (
          <Text color="brand.500" fontSize="xs" fontWeight="800" letterSpacing="0.16em" textTransform="uppercase">
            {eyebrow}
          </Text>
        )}
        <Heading size="lg" color="inherit" letterSpacing="-0.02em">
          {title}
        </Heading>
        {description && <Text color="secondaryGray.600">{description}</Text>}
      </VStack>
      {action}
    </Flex>
  );
}
