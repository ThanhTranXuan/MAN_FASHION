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
import { MdArrowDropDown } from 'react-icons/md';

export default function ActiveFilter({ activeFilter, setActiveFilter }) {
  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  return (
    <Menu isLazy>
      <MenuButton
        as={Button}
        size="sm"
        variant="ghost"
        rightIcon={<MdArrowDropDown />}
        _hover={{ bg: 'transparent' }}
        _active={{ bg: 'transparent' }}
      >
        ACTIVE
      </MenuButton>
      <MenuList bg={bgColor} borderColor={borderColor}>
        {[
          { label: 'All', value: null },
          { label: 'Active', value: true },
          { label: 'Inactive', value: false },
        ].map((option) => (
          <MenuItem
            key={option.label}
            bg={bgColor}
            onClick={() => setActiveFilter(option.value)}
          >
            <Flex w="100%" justify="space-between" align="center">
              <Text
                fontWeight={activeFilter === option.value ? 'bold' : 'normal'}
              >
                {option.label}
              </Text>
              {activeFilter === option.value && (
                <Box h="36px" w="4px" bg={brandColor} borderRadius="5px" />
              )}
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
