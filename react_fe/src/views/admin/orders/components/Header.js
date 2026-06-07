import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { SearchBar } from 'components/navbar/searchBar/SearchBar';

export default function Header({ title, searchInput, setSearchInput }) {
  return (
    <Flex
      px={{ base: 4, md: '25px' }}
      py="12px"
      justifyContent="space-between"
      align={{ base: 'stretch', md: 'center' }}
      direction={{ base: 'column', md: 'row' }}
      gap={3}
    >
      <Text fontSize={{ base: '18px', md: '22px' }} fontWeight="700">
        {title}
      </Text>
      <Flex gap={2} w={{ base: '100%', md: 'auto' }}>
        <SearchBar
          placeholder="Tìm kiếm đơn hàng..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </Flex>
    </Flex>
  );
}
