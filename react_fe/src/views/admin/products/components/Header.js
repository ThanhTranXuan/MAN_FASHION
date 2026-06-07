import React from 'react';
import { Flex, Text, IconButton, useColorModeValue } from '@chakra-ui/react';
import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { MdAdd } from 'react-icons/md';

export default function Header({ searchInput, setSearchInput, onAdd }) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  return (
    <Flex
      px={{ base: 4, md: '25px' }}
      py="12px"
      justifyContent="space-between"
      align={{ base: 'stretch', md: 'center' }}
      direction={{ base: 'column', md: 'row' }}
      gap={3}
    >
      <Text color={textColor} fontSize={{ base: '18px', md: '22px' }} fontWeight="700">
        Danh Sách Sản Phẩm
      </Text>
      <Flex gap={2} w={{ base: '100%', md: 'auto' }}>
        <SearchBar
          placeholder="Tìm kiếm sản phẩm..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
             <IconButton
          aria-label="Add new"
          icon={<MdAdd />}
          colorScheme="green"
          size="md"
          borderRadius="2xl"
          onClick={onAdd}
        />
      </Flex>
    </Flex>
  );
}
