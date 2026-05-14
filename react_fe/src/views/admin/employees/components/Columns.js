import { createColumnHelper } from '@tanstack/react-table';
import { Text, Flex, IconButton } from '@chakra-ui/react';

import { MdEdit, MdDelete } from 'react-icons/md';
import { RiEyeFill } from 'react-icons/ri';
import { formatUSD } from 'utils/FormatHelper';

const columnHelper = createColumnHelper();

export default function Columns({ onShow, onEdit, onDelete, textColor }) {
  return [
    columnHelper.accessor('email', {
      header: 'EMAIL',
      cell: (info) => (
        <Text fontSize="sm" fontWeight="600" color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('fullName', {
      header: 'Họ Tên',
      cell: (info) => <Text>{info.getValue() || '-'}</Text>,
    }),
    columnHelper.accessor('hourlyRate', {
      header: 'Lương Giờ',
      cell: (info) => <Text>{formatUSD(info.getValue()) || '-'}</Text>,
    }),
    columnHelper.display({
      id: 'actions',
      header: <Text align="right">THAO TÁC</Text>,
      cell: (info) => {
        const row = info.row.original;
        return (
          <Flex justify="flex-end" gap={2}>
            <IconButton
              aria-label="View"
              icon={<RiEyeFill style={{ fontSize: '20px' }} />}
              size="sm"
              borderRadius="xl" 
              colorScheme="purple"
              onClick={() => onShow(row)}
            />
            <IconButton
              aria-label="Edit"
              icon={<MdEdit style={{ fontSize: '20px' }} />}
              size="sm"
              borderRadius="xl" 
              colorScheme="blue"
              onClick={() => onEdit(row)}
            />
            <IconButton
              aria-label="Delete"
              icon={<MdDelete style={{ fontSize: '20px' }} />}
              size="sm"
              borderRadius="xl" 
              colorScheme="red"
              onClick={() => onDelete(row)}
            />
          </Flex>
        );
      },
    }),
  ];
}
