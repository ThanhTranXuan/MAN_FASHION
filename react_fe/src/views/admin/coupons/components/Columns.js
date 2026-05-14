import React from 'react';
import { Text, Flex, IconButton } from '@chakra-ui/react';

import { createColumnHelper } from '@tanstack/react-table';
import { MdEdit, MdDelete } from 'react-icons/md';

const columnHelper = createColumnHelper();

export default function Columns(
  onOpen,
  setEditingCoupon,
  setCouponToDelete,
  setIsConfirmOpen,
) {
  return [
    columnHelper.accessor('code', {
      header: 'MÃ',
      cell: (info) => <Text>{info.getValue() || '-'}</Text>,
    }),
    columnHelper.accessor('discountValue', {
      header: 'GIÁ TRỊ GIẢM',
      cell: (info) => <Text>{info.getValue() || 0}%</Text>,
    }),
    columnHelper.accessor('startDate', {
      header: 'BẮT ĐẦU',
      cell: (info) => {
        const value = info.getValue();
        return (
          <Text>{value ? new Date(value).toLocaleDateString() : '-'}</Text>
        );
      },
    }),
    columnHelper.accessor('endDate', {
      header: 'KẾT THÚC',
      cell: (info) => {
        const value = info.getValue();
        return (
          <Text>{value ? new Date(value).toLocaleDateString() : '-'}</Text>
        );
      },
    }),
    columnHelper.accessor('usedCount', {
      header: 'ĐÃ DÙNG',
      cell: (info) => <Text>{info.getValue() || 0}</Text>,
    }),
    columnHelper.accessor('usageLimit', {
      header: 'GIỚI HẠN',
      cell: (info) => <Text>{info.getValue() || 0}</Text>,
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <Text textAlign="right">THAO TÁC</Text>,
      cell: (info) => (
        <Flex justify="flex-end" gap={2}>
          <IconButton
            aria-label="Edit"
            size="sm"
            icon={<MdEdit style={{ fontSize: '20px' }} />}
            colorScheme="blue"
            onClick={() => {
              setEditingCoupon(info.row.original);
              onOpen();
            }}
            borderRadius="xl" 
          />
          <IconButton
            aria-label="Delete"
            size="sm"
            icon={<MdDelete style={{ fontSize: '20px' }} />}
            colorScheme="red"
            onClick={() => {
              setCouponToDelete(info.row.original);
              setIsConfirmOpen(true);
            }}
            borderRadius="xl" 
          />
        </Flex>
      ),
    }),
  ];
}
