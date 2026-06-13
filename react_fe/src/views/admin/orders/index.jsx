import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Box, Card, useColorModeValue } from '@chakra-ui/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useAppToast } from 'utils/ToastHelper';
import { useNotification } from 'contexts/NotificationContext';

import Header from './components/Header';
import Columns from './components/Columns';
import List from './components/List';
import Pagination from 'components/pagination/Pagination';
import Detail from './components/Detail';
import OrderService from 'services/OrderService';

export default function OrderPage() {
  const bgColor = useColorModeValue('white', 'navy.800');
  const toast = useAppToast();

  const {
    clearNotification,
    refreshOrderSignal,
    latestOrderStatusEvent,
  } = useNotification();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingRow, setLoadingRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🆕 Cooldown state để chống spam reload WS
  const [lastReloadTime, setLastReloadTime] = useState(0);
  const wsReloadTimeoutRef = useRef(null);

  // 📦 Load orders
  const loadOrders = useCallback(
    async (p = 0, { silent = false } = {}) => {
      try {
        if (!silent) setIsLoading(true);
        const res = await OrderService.getAllAdmin({
          page: p,
          size: 10,
          code: searchInput || undefined,
          status: statusFilter || undefined,
        });
        setOrders(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error(err);
        if (!silent) toast.error('Tải danh sách đơn hàng thất bại');
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchInput, statusFilter],
  );

  // ⏩ Load khi page/filter đổi
  useEffect(() => {
    loadOrders(page).then(() => {
      clearNotification('/admin/order-management');
      localStorage.setItem('lastFetch:/admin/order-management', Date.now());
    });
  }, [page, statusFilter, loadOrders, clearNotification]);

  // ------------------------------
  // 🚨 WS RELOAD với cooldown 60s + debounce 300ms
  // ------------------------------
  useEffect(() => {
    if (!refreshOrderSignal) return;

    const now = Date.now();
    const timeSinceLast = now - lastReloadTime;

    // ==============================
    // ⚙️ THÔNG SỐ TÙY CHỈNH  
    // ==============================
    const COOLDOWN = 60000; // ⏱️ Reload cách nhau tối thiểu 60 giây
    const DEBOUNCE = 300; // ⏳ Gộp nhiều WS sát nhau
    // ==============================

    if (timeSinceLast < COOLDOWN) {
      console.log(`⏭ WS ignored (cooldown ${Math.round(
        (COOLDOWN - timeSinceLast) / 1000
      )}s left)`);
      return;
    }

    if (wsReloadTimeoutRef.current) {
      clearTimeout(wsReloadTimeoutRef.current);
    }

    wsReloadTimeoutRef.current = setTimeout(() => {
      console.log("🔄 WS: refreshing order list (silent + cooldown)");
      loadOrders(page, { silent: true });
      setLastReloadTime(Date.now());
    }, DEBOUNCE);

  }, [refreshOrderSignal, lastReloadTime, loadOrders, page]);

  useEffect(() => {
    if (!latestOrderStatusEvent) return;

    setOrders((current) =>
      current.map((order) =>
        order.orderCode === latestOrderStatusEvent.orderCode
          ? { ...order, status: latestOrderStatusEvent.status }
          : order,
      ),
    );
    setSelectedOrder((current) =>
      current?.orderCode === latestOrderStatusEvent.orderCode
        ? { ...current, status: latestOrderStatusEvent.status }
        : current,
    );
  }, [latestOrderStatusEvent]);

  // 🔁 Auto refresh mỗi 60 giây khi đang xem trang
  useEffect(() => {
    const interval = setInterval(() => {
      if (!navigator.onLine) return;
      if (document.visibilityState !== 'visible') return;

      loadOrders(page, { silent: true });
    }, 60000);

    return () => clearInterval(interval);
  }, [loadOrders, page]);

  const handleUpdateStatus = useCallback(
    async (orderCode, newStatus) => {
      try {
        const updatedOrder = await OrderService.updateAdminStatus(
          orderCode,
          newStatus,
        );
        setOrders((current) =>
          current.map((order) =>
            order.orderCode === orderCode ? { ...order, ...updatedOrder } : order,
          ),
        );
        setSelectedOrder((current) =>
          current?.orderCode === orderCode
            ? { ...current, ...updatedOrder }
            : current,
        );
        toast.success('Cập nhật trạng thái đơn hàng thành công');
      } catch (err) {
        console.error(err);
        toast.error(
          err.response?.data?.message ||
            'Cập nhật trạng thái đơn hàng thất bại',
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const columns = useMemo(
    () =>
      Columns({
        onUpdateStatus: handleUpdateStatus,
        onOpenDetail: (order) => {
          setSelectedOrder(order);
          setIsDetailOpen(true);
        },
        statusFilter,
        setStatusFilter,
        loadingRow,
        setLoadingRow,
      }),
    [statusFilter, handleUpdateStatus, loadingRow],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Box>
      <Card flexDirection="column" w="100%" borderRadius="16px" boxShadow="md" bg={bgColor}>
        <Header
          title="Danh Sách Đơn Hàng"
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        <List table={table} isLoading={isLoading} />
      </Card>

      {!isLoading && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Detail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
      />
    </Box>
  );
}
