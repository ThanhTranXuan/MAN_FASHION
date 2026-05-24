import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Box,
  Flex,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { flexRender } from '@tanstack/react-table';
import Row from 'views/admin/products/components/Row';

export default function List({
  table,
  products,
  expandedRows,
  toggleExpand,
  onAddVariant,
  onEdit,
  onDelete,
  onOpenImages,
  onEditVariant,
  onDeleteVariant,
  isLoading,
}) {
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const headerBg = useColorModeValue('gray.100', 'navy.800');
  const bgColor = useColorModeValue('white', 'navy.800');

  return (
    <Box minH="600px" overflowX="auto" p={3} position="relative">
      {/* 🔄 Loading overlay (chỉ phủ table body) */}
      {isLoading && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="calc(100% - 60px)"
          align="center"
          justify="center"
          bg="blackAlpha.50"
          backdropFilter="blur(1px)"
          zIndex="1"
          transition="opacity 0.2s ease"
        >
          <Spinner size="xl" thickness="4px" speed="0.65s" color="brand.500" />
        </Flex>
      )}

      <Table
        variant="simple"
        bg={bgColor}
        opacity={isLoading ? 0.72 : 1}
        transition="opacity 0.2s ease"
      >
        <Thead bg={headerBg}>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th
                  key={header.id}
                  borderColor={borderColor}
                  fontSize="12px"
                  color={textColor}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>

        <Tbody>
          {products.map((p) => (
            <Row
              key={p.id}
              product={p}
              expandedRows={expandedRows}
              toggleExpand={toggleExpand}
              onAddVariant={onAddVariant}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenImages={onOpenImages}
              onEditVariant={onEditVariant}
              onDeleteVariant={onDeleteVariant}
            />
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
