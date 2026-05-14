import React from 'react';
import {
  Text,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { ChevronDownIcon } from '@chakra-ui/icons';
import StatusFilter from './StatusFilter';
import { formatUSD } from 'utils/FormatHelper';

const columnHelper = createColumnHelper();

const STATUS_META = {
  REQUESTED: { label: 'REQUESTED', text: 'Đã Yêu Cầu', color: 'yellow', emoji: '📨' },
  APPROVED: { label: 'APPROVED', text: 'Đã Duyệt', color: 'blue', emoji: '✅' },
  REJECTED: { label: 'REJECTED', text: 'Đã Từ Chối', color: 'red', emoji: '❌' },
  RECEIVED: { label: 'RECEIVED', text: 'Đã Nhận Hàng', color: 'purple', emoji: '📦' },
  COMPLETED: { label: 'COMPLETED', text: 'Hoàn Thành', color: 'green', emoji: '💰' },
};

// ✅ flow hợp lệ
function getNextStatuses(current) {
  switch (current) {
    case 'REQUESTED':
      return ['APPROVED', 'REJECTED'];
    case 'APPROVED':
      return ['RECEIVED'];
    case 'RECEIVED':
      return ['COMPLETED'];
    default:
      return [];
  }
}

export default function Columns({
  onUpdateStatus,
  statusFilter,
  setStatusFilter,
  loadingRow,
  setLoadingRow,
}) {
  return [
    columnHelper.accessor('returnCode', {
      header: 'MÃ HOÀN TRẢ',
      cell: (info) => (
        <Text fontWeight="600" color="brand.500">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('orderCode', {
      header: 'MÃ ĐƠN',
      cell: (info) => <Text fontWeight="600">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('refundAmount', {
      header: 'SỐ TIỀN HOÀN',
      cell: (info) => (
        <Text color="green.500" fontWeight="bold">
          {formatUSD(info.getValue())}
        </Text>
      ),
    }),
    columnHelper.accessor('reason', {
      header: 'LÝ DO',
      cell: (info) => <Text noOfLines={2}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('note', {
      header: 'GHI CHÚ',
      cell: (info) => (
        <Text noOfLines={2} color="gray.500">
          {info.getValue() || '-'}
        </Text>
      ),
    }),

    // 🔽 Cột trạng thái có logic flow + loading
    columnHelper.accessor('status', {
      header: () => (
        <Flex justify="end">
          <StatusFilter
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </Flex>
      ),
      cell: (info) => {
        const row = info.row.original;
        const currentStatus = (info.getValue() || '').toUpperCase();
        const meta = STATUS_META[currentStatus] || {
          label: currentStatus || 'UNKNOWN',
          text: currentStatus || 'UNKNOWN',
          color: 'gray',
          emoji: '❔',
        };

        const nextStatuses = getNextStatuses(currentStatus);
        const isFinal = nextStatuses.length === 0;
        const isLoading = loadingRow === row.returnCode;

        const handleChangeStatus = async (newStatus) => {
          try {
            setLoadingRow(row.returnCode);
            await onUpdateStatus(row.returnCode, newStatus);
          } finally {
            setLoadingRow(null);
          }
        };

        return (
          <Flex justify="end">
            <HStack spacing={2}>
              <Menu isLazy>
                <MenuButton
                  as={Button}
                  size="sm"
                  rightIcon={isFinal ? undefined : <ChevronDownIcon />}
                  fontWeight="600"
                  colorScheme={
                    meta.label === 'REQUESTED'
                      ? 'yellow'
                      : meta.label === 'APPROVED'
                      ? 'blue'
                      : meta.label === 'REJECTED'
                      ? 'red'
                      : meta.label === 'RECEIVED'
                      ? 'purple'
                      : meta.label === 'COMPLETED'
                      ? 'green'
                      : 'gray'
                  }
                  variant="outline"
                  isDisabled={isFinal}
                  isLoading={isLoading}
                >
                  <Flex align="center" gap={2}>
                    <Text fontSize="lg">{meta.emoji}</Text>
                    <Text>{meta.text}</Text>
                  </Flex>
                </MenuButton>

                {!isFinal && (
                  <MenuList minW="180px">
                    {nextStatuses.map((st) => {
                      const m = STATUS_META[st];
                      return (
                        <MenuItem
                          key={st}
                          onClick={() => handleChangeStatus(st)}
                          _hover={{ bg: 'gray.100' }}
                        >
                          <Flex align="center" gap={2}>
                            <Text fontSize="lg">{m?.emoji}</Text>
                            <Text fontWeight="600" color={m?.color + '.500'}>
                              {m?.text}
                            </Text>
                          </Flex>
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                )}
              </Menu>
            </HStack>
          </Flex>
        );
      },
    }),
  ];
}
