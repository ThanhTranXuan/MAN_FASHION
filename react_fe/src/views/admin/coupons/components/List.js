import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  Box,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

export default function List({ coupons, columns, borderColor, headerBg, isLoading }) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');

  const table = useReactTable({
    data: coupons,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <Box minH={{ base: '360px', md: '520px' }} overflowX="auto" p={{ base: 2, md: 3 }} position="relative" bg={bgColor} borderRadius="10px">
      {}
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
          {!isLoading && rows.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length} textAlign="center" py={8}>
                <Text color="gray.500" fontSize="sm">
                  Không tìm thấy mã giảm giá phù hợp.
                </Text>
              </Td>
            </Tr>
          ) : (
            rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    borderColor={borderColor}
                    fontSize="14px"
                    color={textColor}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
