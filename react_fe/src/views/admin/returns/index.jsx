import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { Box, Card, useColorModeValue } from '@chakra-ui/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useAppToast } from 'utils/ToastHelper';
import { useNotification } from 'contexts/NotificationContext';

import Pagination from 'components/pagination/Pagination';
import Header from './components/Header';
import Columns from './components/Columns';
import List from './components/List';
import ReturnOrderService from 'services/ReturnOrderService';

export default function ReturnPage() {
  const bgColor = useColorModeValue('white', 'navy.800');
  const toast = useAppToast();

  const { clearNotification, refreshReturnSignal } = useNotification();

  const [returns, setReturns] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRow, setLoadingRow] = useState(null);

  // 🆕 Cooldown state
  const [lastReloadTime, setLastReloadTime] = useState(0);
  const wsReloadTimeoutRef = useRef(null);

  // 📦 Load returns
  const loadReturns = useCallback(
    async (p = 0, { silent = false } = {}) => {
      try {
        if (!silent) setIsLoading(true);
        const res = await ReturnOrderService.getAllAdmin({
          page: p,
          size: 10,
          status: statusFilter || undefined,
        });
        setReturns(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error(err);
        if (!silent) toast.error('Failed to load return orders');
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusFilter],
  );

  // ⏩ Load khi page/filter đổi
  useEffect(() => {
    loadReturns(page).then(() => {
      clearNotification('/admin/return-management');
      localStorage.setItem('lastFetch:/admin/return-management', Date.now());
    });
  }, [page, statusFilter, loadReturns, clearNotification]);

  // ------------------------------
  // 🚨 WS RELOAD với cooldown 60s + debounce 300ms
  // ------------------------------
  useEffect(() => {
    if (!refreshReturnSignal) return;

    const now = Date.now();
    const timeSinceLast = now - lastReloadTime;

    // ==============================
    // ⚙️ THÔNG SỐ TÙY CHỈNH
    // ==============================
    const COOLDOWN = 60000; // 1 phút
    const DEBOUNCE = 300; // gom WS gần nhau
    // ==============================

    if (timeSinceLast < COOLDOWN) {
      console.log(
        `⏭ WS return ignored (${Math.round(
          (COOLDOWN - timeSinceLast) / 1000,
        )}s cooldown left)`,
      );
      return;
    }

    if (wsReloadTimeoutRef.current) {
      clearTimeout(wsReloadTimeoutRef.current);
    }

    wsReloadTimeoutRef.current = setTimeout(() => {
      console.log('🔄 WS: refreshing return list (silent + cooldown)');
      loadReturns(page, { silent: true });
      setLastReloadTime(Date.now());
    }, DEBOUNCE);
  }, [refreshReturnSignal, lastReloadTime, loadReturns, page]);

  // 🔁 Auto refresh mỗi 60 giây
  useEffect(() => {
    const interval = setInterval(() => {
      if (!navigator.onLine) return;
      if (document.visibilityState !== 'visible') return;

      loadReturns(page, { silent: true });
    }, 60000);

    return () => clearInterval(interval);
  }, [loadReturns, page]);

  const columns = useMemo(
    () =>
      Columns({
        onUpdateStatus: async (rCode, status) => {
          try {
            await ReturnOrderService.updateStatusAdmin(rCode, status);
            toast.success(`Return ${rCode} updated to ${status}`);
            loadReturns(page);
          } catch (err) {
            console.error(err);
            toast.error('Failed to update return status');
          }
        },
        statusFilter,
        setStatusFilter,
        loadingRow,
        setLoadingRow,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusFilter, page, loadReturns, loadingRow],
  );

  const table = useReactTable({
    data: returns,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Box>
      <Card
        flexDirection="column"
        w="100%"
        borderRadius="16px"
        boxShadow="md"
        bg={bgColor}
      >
        <Header
          title="Return Management"
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        <List table={table} isLoading={isLoading} />
      </Card>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
}
