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
      px={{ base: 4, md: '25px' }}
      py="12px"
      justifyContent="space-between"
      align={{ base: 'stretch', md: 'center' }}
      direction={{ base: 'column', md: 'row' }}
      gap={3}
      flexWrap="wrap"
    >
      <Text fontSize={{ base: '18px', md: '22px' }} fontWeight="700">
        {title || 'Danh Sách Hoàn Trả'}
      </Text>

      <Flex gap={3} align="center" w={{ base: '100%', md: 'auto' }}>
        {/* Search theo return/order code */}
        <SearchBar
          placeholder="Tìm kiếm đơn hoàn trả..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          width={{ base: '100%', md: '280px' }}
        />
      </Flex>
    </Flex>
  );
}
