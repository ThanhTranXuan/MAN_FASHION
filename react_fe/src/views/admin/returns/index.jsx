import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  Box,
  Card,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  Button,
} from '@chakra-ui/react';
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
  const [rejectingReturn, setRejectingReturn] = useState(null);
  const [rejectReason, setRejectReason] = useState('');


  const [lastReloadTime, setLastReloadTime] = useState(0);
  const wsReloadTimeoutRef = useRef(null);
  const updateStatusFilter = useCallback((nextStatus) => {
    setPage(0);
    setStatusFilter(nextStatus);
  }, []);


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

    [searchKeyword, statusFilter],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setSearchKeyword(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);


  useEffect(() => {
    loadReturns(page).then(() => {
      clearNotification('/admin/return-management');
      localStorage.setItem('lastFetch:/admin/return-management', Date.now());
    });
  }, [page, statusFilter, searchKeyword, loadReturns, clearNotification]);




  useEffect(() => {
    if (!refreshReturnSignal) return;

    const now = Date.now();
    const timeSinceLast = now - lastReloadTime;




    const COOLDOWN = 60000;
    const DEBOUNCE = 300;


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
        onReject: (returnOrder) => {
          setRejectingReturn(returnOrder);
          setRejectReason('');
        },
      }),

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

      <Modal
        isOpen={Boolean(rejectingReturn)}
        onClose={() => setRejectingReturn(null)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Từ chối yêu cầu hoàn trả</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Lý do từ chối</FormLabel>
              <Textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Nhập lý do để khách hàng có thể xem"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setRejectingReturn(null)}>
              Hủy
            </Button>
            <Button
              colorScheme="red"
              isDisabled={!rejectReason.trim()}
              isLoading={loadingRow === rejectingReturn?.returnCode}
              onClick={async () => {
                const returnCode = rejectingReturn.returnCode;
                try {
                  setLoadingRow(returnCode);
                  const updatedReturn = await ReturnOrderService.updateStatusAdmin(
                    returnCode,
                    'REJECTED',
                    rejectReason.trim(),
                  );
                  setReturns((current) =>
                    current.map((item) =>
                      item.returnCode === returnCode
                        ? { ...item, ...updatedReturn }
                        : item,
                    ),
                  );
                  setRejectingReturn(null);
                  toast.success('Đã từ chối yêu cầu hoàn trả');
                } catch (err) {
                  console.error(err);
                  toast.error('Không thể từ chối yêu cầu hoàn trả');
                } finally {
                  setLoadingRow(null);
                }
              }}
            >
              Xác nhận từ chối
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
