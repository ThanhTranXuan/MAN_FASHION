import {
  Text,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  IconButton,
  Badge,
} from '@chakra-ui/react';
import { MdInfoOutline } from 'react-icons/md';
import { FaQrcode, FaMoneyBillWave } from 'react-icons/fa';
import { createColumnHelper } from '@tanstack/react-table';
import { ChevronDownIcon } from '@chakra-ui/icons';
import StatusFilter from './StatusFilter';
import { formatUSD } from 'utils/FormatHelper';

const columnHelper = createColumnHelper();

export default function Columns({
  onUpdateStatus,
  onOpenDetail,
  statusFilter,
  setStatusFilter,
  loadingRow,
  setLoadingRow,
}) {
  const STATUS_OPTIONS = [
    { label: 'PENDING', text: 'Chờ Xử Lý', color: 'yellow.500', emoji: '⏳' },
    { label: 'PAID', text: 'Đã Thanh Toán', color: 'teal.500', emoji: '💰' },
    { label: 'SHIPPED', text: 'Đang Giao', color: 'purple.500', emoji: '🚚' },
    { label: 'DELIVERED', text: 'Đã Giao', color: 'blue.500', emoji: '📦' },
    { label: 'COMPLETED', text: 'Hoàn Thành', color: 'green.500', emoji: '✅' },
    { label: 'RETURN', text: 'Hoàn Trả', color: 'orange.400', emoji: '↩️' },
    { label: 'CANCELLED', text: 'Đã Hủy', color: 'red.500', emoji: '❌' },
  ];

  // Quy tắc chuyển trạng thái
  const getAllowedTransitions = (current) => {
    switch (current) {
      case 'PENDING':
        return ['PAID', 'SHIPPED', 'CANCELLED'];
      case 'PAID':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['DELIVERED', 'CANCELLED'];
      case 'RETURN':
        return ['CANCELLED', 'COMPLETED'];
      default:
        return [];
    }
  };

  return [
    columnHelper.accessor('orderCode', {
      header: 'MÃ ĐƠN',
      cell: (info) => <Text fontWeight="600">{info.getValue()}</Text>,
    }),

    columnHelper.accessor('fullName', {
      header: 'KHÁCH HÀNG',
      cell: (info) => <Text>{info.getValue()}</Text>,
    }),

    columnHelper.accessor('finalTotal', {
      header: 'TỔNG TIỀN',
      cell: (info) => (
        <Text color="brand.500" fontWeight="bold">
          {formatUSD(info.getValue())}
        </Text>
      ),
    }),

    columnHelper.accessor('paymentMethod', {
      header: 'PHƯƠNG THỨC TT',
      cell: (info) => {
        const method = info.getValue();
        if (method === 'VIETQR') {
          return (
            <Badge
              colorScheme="teal"
              variant="solid"
              px={3}
              py={1}
              borderRadius="full"
            >
              <Flex align="center" gap={1.5}>
                <FaQrcode />
                <Text fontWeight="600">VIETQR</Text>
              </Flex>
            </Badge>
          );
        }
        if (method === 'COD') {
          return (
            <Badge
              colorScheme="orange"
              variant="solid"
              px={3}
              py={1}
              borderRadius="full"
            >
              <Flex align="center" gap={1.5}>
                <FaMoneyBillWave />
                <Text fontWeight="600">COD</Text>
              </Flex>
            </Badge>
          );
        }
        return <Badge colorScheme="gray">—</Badge>;
      },
    }),

    columnHelper.accessor('status', {
      header: () => (
        <StatusFilter
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      ),
      cell: (info) => {
        const order = info.row.original;
        const current = STATUS_OPTIONS.find(
          (st) => st.label === info.getValue(),
        );
        const allowed = getAllowedTransitions(info.getValue());
        const isLoading = loadingRow === order.orderCode;

        const handleChangeStatus = async (newStatus) => {
          try {
            setLoadingRow(order.orderCode);
            await onUpdateStatus(order.orderCode, newStatus);
          } finally {
            setLoadingRow(null);
          }
        };

        return (
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              rightIcon={allowed.length > 0 ? <ChevronDownIcon /> : undefined}
              fontWeight="600"
              colorScheme={
                current?.label === 'PENDING'
                  ? 'yellow'
                  : current?.label === 'PAID'
                  ? 'teal'
                  : current?.label === 'SHIPPED'
                  ? 'purple'
                  : current?.label === 'DELIVERED'
                  ? 'blue'
                  : current?.label === 'COMPLETED'
                  ? 'green'
                  : current?.label === 'RETURN'
                  ? 'orange'
                  : current?.label === 'CANCELLED'
                  ? 'red'
                  : 'gray'
              }
              variant="outline"
              borderRadius="md"
              isLoading={isLoading}
              isDisabled={allowed.length === 0}
            >
              <Flex align="center" gap={2}>
                <Text fontSize="lg">{current?.emoji}</Text>
                <Text>{current?.text || 'UNKNOWN'}</Text>
              </Flex>
            </MenuButton>

            {allowed.length > 0 && (
              <MenuList minW="160px">
                {STATUS_OPTIONS.filter((st) => allowed.includes(st.label)).map(
                  (st) => (
                    <MenuItem
                      key={st.label}
                      onClick={() => handleChangeStatus(st.label)}
                      _hover={{ bg: 'gray.100' }}
                    >
                      <Flex align="center" gap={2}>
                        <Text fontSize="lg">{st.emoji}</Text>
                        <Text fontWeight="600" color={st.color}>
                          {st.text}
                        </Text>
                      </Flex>
                    </MenuItem>
                  ),
                )}
              </MenuList>
            )}
          </Menu>
        );
      },
    }),

    // === CỘT CHI TIẾT ===
    columnHelper.display({
      id: 'detail',
      header: <Text align="right">Hành Động</Text>,
      cell: (info) => {
        const order = info.row.original;
        return (
          <Flex justify="flex-end">
            <IconButton
              icon={<MdInfoOutline style={{ fontSize: '20px' }} />}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              aria-label="View Detail"
              borderRadius={10}
              onClick={() => onOpenDetail(order)}
            />
          </Flex>
        );
      },
    }),
  ];
}
