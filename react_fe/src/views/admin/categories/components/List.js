import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Box,
  Flex,
  Text,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { flexRender } from '@tanstack/react-table';
import Row from 'views/admin/categories/components/Row';

export default function List({
  table,
  treeData,
  expandedRows,
  toggleExpand,
  onAdd,
  onEdit,
  onDelete,
  isLoading,
}) {
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const headerBg = useColorModeValue('gray.100', 'navy.800');
  const bgColor = useColorModeValue('white', 'navy.800');

  const renderRow = (cat, depth = 0) => (
    <Row
      key={cat.id}
      cat={cat}
      depth={depth}
      expandedRows={expandedRows}
      toggleExpand={toggleExpand}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      renderChildren={renderRow}
    />
  );

  const hasData = treeData && treeData.length > 0;

  return (
    <Box minH="600px" overflowX="auto" p={3} position="relative" bg={bgColor} borderRadius="10px">
      {/* 🔄 Loading overlay */}
      {isLoading && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          align="center"
          justify="center"
          zIndex="1"
         backdropFilter="blur(2px)"
        >
          <Spinner size="xl" thickness="4px" speed="0.65s" color="brand.500" />
        </Flex>
      )}

      <Table variant="simple" bg={bgColor} opacity={isLoading ? 0.6 : 1}>
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
          {!isLoading && !hasData ? (
            <Tr>
              <Th colSpan={table.getAllColumns().length} py={10} textAlign="center">
                <Text color="gray.500" fontSize="sm">
                  No categories found.
                </Text>
              </Th>
            </Tr>
          ) : (
            hasData && treeData.map((cat) => renderRow(cat))
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
