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

export default function StatusFilter({ statusFilter, setStatusFilter }) {
  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  const options = [
    { label: 'Tất Cả', value: null },
    { label: 'Yêu Cầu', value: 'REQUESTED' },
    { label: 'Đã Duyệt', value: 'APPROVED' },
    { label: 'Từ Chối', value: 'REJECTED' },
    { label: 'Đã Nhận', value: 'RECEIVED' },
    { label: 'Hoàn Thành', value: 'COMPLETED' },
  ];

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
        TRẠNG THÁI
      </MenuButton>
      <MenuList bg={bgColor} borderColor={borderColor}>
        {options.map((option) => (
          <MenuItem key={option.label} bg={bgColor} onClick={() => setStatusFilter(option.value)}>
            <Flex w="100%" justify="space-between" align="center">
              <Text fontWeight={statusFilter === option.value ? 'bold' : 'normal'} fontSize={16}>
                {option.label}
              </Text>
              {statusFilter === option.value && (
                <Box h="24px" w="2px" bg={brandColor} borderRadius="5px" />
              )}
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
