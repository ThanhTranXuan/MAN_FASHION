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

  const {
    clearNotification,
    refreshReturnSignal,
    latestReturnStatusEvent,
  } = useNotification();

  const [returns, setReturns] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRow, setLoadingRow] = useState(null);

  // 🆕 Cooldown state
  const [lastReloadTime, setLastReloadTime] = useState(0);
  const wsReloadTimeoutRef = useRef(null);
  const updateStatusFilter = useCallback((nextStatus) => {
    setPage(0);
    setStatusFilter(nextStatus);
  }, []);

  // 📦 Load returns
  const loadReturns = useCallback(
    async (p = 0, { silent = false } = {}) => {
      try {
        if (!silent) setIsLoading(true);
        const res = await ReturnOrderService.getAllAdmin({
          page: p,
          size: 10,
          keyword: searchKeyword || undefined,
          status: statusFilter || undefined,
        });
        setReturns(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error(err);
        if (!silent) toast.error('Tải danh sách hoàn trả thất bại');
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchKeyword, statusFilter],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setSearchKeyword(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ⏩ Load khi page/filter đổi
  useEffect(() => {
    loadReturns(page).then(() => {
      clearNotification('/admin/return-management');
      localStorage.setItem('lastFetch:/admin/return-management', Date.now());
    });
  }, [page, statusFilter, searchKeyword, loadReturns, clearNotification]);

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

  useEffect(() => {
    if (!latestReturnStatusEvent) return;

    setReturns((current) =>
      current.map((returnOrder) =>
        returnOrder.returnCode === latestReturnStatusEvent.returnCode
          ? { ...returnOrder, status: latestReturnStatusEvent.status }
          : returnOrder,
      ),
    );
  }, [latestReturnStatusEvent]);

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
            const updatedReturn =
              await ReturnOrderService.updateStatusAdmin(rCode, status);
            setReturns((current) =>
              current.map((returnOrder) =>
                returnOrder.returnCode === rCode
                  ? { ...returnOrder, ...updatedReturn }
                  : returnOrder,
              ),
            );
            toast.success('Cập nhật trạng thái hoàn trả thành công');
          } catch (err) {
            console.error(err);
            toast.error('Cập nhật trạng thái thất bại');
          }
        },
        statusFilter,
        setStatusFilter: updateStatusFilter,
        loadingRow,
        setLoadingRow,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusFilter, page, loadReturns, loadingRow, updateStatusFilter],
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
          title="Danh Sách Yêu Cầu Hoàn Trả"
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          statusFilter={statusFilter}
          setStatusFilter={updateStatusFilter}
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
