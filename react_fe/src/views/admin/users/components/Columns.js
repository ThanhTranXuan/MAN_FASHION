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
      header: 'FULL NAME',
      cell: (info) => <Text>{info.getValue() || '-'}</Text>,
    }),
    columnHelper.accessor('roleName', {
      header: 'Role',
      cell: (info) => <Text>{info.getValue() || '-'}</Text>,
    }),
  ];
}
