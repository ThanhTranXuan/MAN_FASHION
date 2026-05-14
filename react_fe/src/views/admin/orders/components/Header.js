import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { SearchBar } from 'components/navbar/searchBar/SearchBar';

export default function Header({ title, searchInput, setSearchInput }) {
  return (
    <Flex px="25px" my="8px" justifyContent="space-between" align="center" gap={3}>
      <Text fontSize="22px" fontWeight="700">{title}</Text>
      <Flex gap={2}>
        <SearchBar
          placeholder="Tìm kiếm đơn hàng..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </Flex>
    </Flex>
  );
}
