import React from 'react';
import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Image,
  HStack,
  Center,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import { formatUSD } from 'utils/FormatHelper';

export default function TopProductsTable({ products = [] }) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  return (
    <Card flexDirection="column" w="100%" px="0px" h="100%">
      {/* TITLE */}
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text color={textColor} fontSize="22px" fontWeight="700">
          Top Products Sold
        </Text>
      </Flex>

      <Box flex="1" overflowX="auto">
        <Table variant="simple" color="gray.500" mb="24px">
          <Thead>
            <Tr>
              <Th borderColor={borderColor}>Product</Th>
              <Th borderColor={borderColor}>Sold</Th>
              <Th borderColor={borderColor}>Revenue</Th>
            </Tr>
          </Thead>

          <Tbody>
            {/* 🌟 EMPTY STATE TRONG TABLE */}
            {products.length === 0 ? (
              <Tr>
                <Td colSpan={3} py="40px">
                  <Center>
                    <Text color="gray.500">No product data available</Text>
                  </Center>
                </Td>
              </Tr>
            ) : (
              products.map((p, idx) => (
                <Tr key={idx}>
                  <Td>
                    <HStack spacing={3}>
                      <Image
                        src={p.thumbnailUrl}
                        alt={p.productName}
                        boxSize="40px"
                        borderRadius="md"
                        objectFit="cover"
                        fallbackSrc="https://via.placeholder.com/40x40?text=?"
                      />
                      <Text fontWeight="600" color={textColor}>
                        {p.productName || 'Unnamed'}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>{p.sold ?? 0}</Td>
                  <Td>{formatUSD(p.revenue ?? 0)}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
}
