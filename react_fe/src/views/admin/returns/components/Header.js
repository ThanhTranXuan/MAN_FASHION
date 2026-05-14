import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { SearchBar } from 'components/navbar/searchBar/SearchBar';

export default function Header({
  title,
  searchInput,
  setSearchInput,
}) {
  return (
    <Flex
      px="25px"
      py="12px"
      justifyContent="space-between"
      align="center"
      gap={3}
      flexWrap="wrap"
    >
      <Text fontSize="22px" fontWeight="700">
        {title || 'Danh Sách Hoàn Trả'}
      </Text>

      <Flex gap={3} align="center">
        {/* Search theo return/order code */}
        <SearchBar
          placeholder="Tìm kiếm đơn hoàn trả..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          width="280px"
        />
      </Flex>
    </Flex>
  );
}
