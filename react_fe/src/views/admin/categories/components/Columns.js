import { createColumnHelper } from '@tanstack/react-table';
import { Text, Flex, IconButton } from '@chakra-ui/react';

const columnHelper = createColumnHelper();

export default function Columns({
  toggleExpand,
  expandedRows,
}) {
  return [
    columnHelper.accessor('name', {
      header: 'NAME',
      cell: (info) => {
        const row = info.row.original;
        const isExpanded = expandedRows[row.id];
        const hasChildren = row.children && row.children.length > 0;

        return (
          <Flex align="center" gap={2}>
            {hasChildren && (
              <IconButton
                aria-label="Toggle expand"
                size="xs"
                variant="ghost"
                icon={<Text>{isExpanded ? '-' : '+'}</Text>}
                onClick={() => toggleExpand(row.id)}
              />
            )}
            <Text fontWeight="600">{info.getValue()}</Text>
          </Flex>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: <Text align="right">ACTIONS</Text>,
    }),
  ];
}
