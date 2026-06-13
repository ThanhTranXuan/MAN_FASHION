import React from 'react';
import { Box, Heading } from '@chakra-ui/react';

export default function AdminDataCard({ title, children, ...props }) {
  return (
    <Box bg="white" border="1px solid" borderColor="fashion.borderLight" borderRadius="16px" p={{ base: 4, md: 6 }} {...props}>
      {title && <Heading size="md" mb={5}>{title}</Heading>}
      {children}
    </Box>
  );
}
