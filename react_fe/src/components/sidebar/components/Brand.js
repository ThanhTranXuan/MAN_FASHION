import React from 'react';


import { Text, Flex } from '@chakra-ui/react';


import { HSeparator } from 'components/separator/Separator';

export function SidebarBrand() {

  return (
    <Flex align="center" direction="column">
      <Text
        fontSize={{ base: '2xl', md: '3xl' }}
        fontWeight="800"
        mb={4}
        color="navy.900"
        letterSpacing="-0.04em"
      >
        Trendify
      </Text>
      <HSeparator mb="20px" />
    </Flex>
  );
}

export default SidebarBrand;
