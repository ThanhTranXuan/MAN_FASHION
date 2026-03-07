import React from 'react';

// Chakra imports
import { Text, Flex } from '@chakra-ui/react';

// Custom components
import { HSeparator } from 'components/separator/Separator';

export function SidebarBrand() {
  //   Chakra color mode
  return (
    <Flex align="center" direction="column">
      <Text
        fontSize={{ base: '3xl', md: '5xl' }}
        fontWeight="bold"
        mb={4}
        bgGradient="linear(to-r, #4facfe, #7366ff, #d633ff, #ff6a00)"
        bgClip="text"
      >
        Trendify
      </Text>
      <HSeparator mb="20px" />
    </Flex>
  );
}

export default SidebarBrand;
