import React from 'react';
import { Box } from '@chakra-ui/react';

export default function AppContainer({ children, ...props }) {
  return (
    <Box
      w="100%"
      maxW="1440px"
      mx="auto"
      px={{ base: 4, md: 8, xl: 12 }}
      {...props}
    >
      {children}
    </Box>
  );
}
