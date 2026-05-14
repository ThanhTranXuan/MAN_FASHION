import { createColumnHelper } from '@tanstack/react-table';
import { Text } from '@chakra-ui/react';

const columnHelper = createColumnHelper();

export default function Columns() {
  return [
    columnHelper.accessor('email', {
      header: 'EMAIL',
      cell: (info) => (
        <Text fontSize="sm" fontWeight="600">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('fullName', {
      header: 'Họ Tên',
      cell: (info) => <Text>{info.getValue() || '-'}</Text>,
    }),
    columnHelper.accessor('roleName', {
      header: 'Vai Trò',
      cell: (info) => <Text>{info.getValue() || '-'}</Text>,
    }),
  ];
}
