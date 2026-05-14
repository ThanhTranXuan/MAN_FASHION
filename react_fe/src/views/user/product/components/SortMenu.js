import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Text,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdKeyboardArrowDown } from 'react-icons/md';

export default function SortMenu({ sort, setSort, setPage }) {
  const handleSelect = (value) => {
    setSort(value);
    setPage(0);
  };

  const options = [
    { value: 'newest', label: 'Mới Nhất' },
    { value: 'price_asc', label: 'Giá: Thấp → Cao' },
    { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  ];

  const currentLabel =
    options.find((opt) => opt.value === sort)?.label || 'Mới Nhất';

  const brandColor = useColorModeValue('brand.500', 'brand.400');

  return (
    <Menu>
      <MenuButton
        px={0}
        as={Button}
        variant="outline"
        rightIcon={<MdKeyboardArrowDown />}
        border="none"
        _active={{ backgroundColor: 'transparent' }}
      >
        <Flex align="center" gap={2}>
          <Text fontSize="sm" fontWeight="500">
            {currentLabel}
          </Text>
        </Flex>
      </MenuButton>

      <MenuList border="none" shadow="lg" py={2}>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            bg="transparent"
            px={4}
            py={2}
          >
            <Flex w="100%" justify="space-between" align="center">
              <Text fontWeight={sort === option.value ? 'bold' : 'normal'}>
                {option.label}
              </Text>
              {sort === option.value && (
                <Box h="20px" w="3px" bg={brandColor} borderRadius="full" />
              )}
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
