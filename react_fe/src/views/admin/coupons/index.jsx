import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Card, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import Pagination from 'components/pagination/Pagination';
import Form from './components/Form';
import ConfirmDialog from 'components/dialog/ConfirmDialog';
import Header from './components/Header';
import Columns from './components/Columns';
import List from './components/List';
import CouponService from 'services/CouponService';

export default function CouponPage() {
  const toast = useAppToast();


  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const bgColor = useColorModeValue('white', 'navy.800');
  const headerBg = useColorModeValue('gray.100', 'navy.800');


  const [coupons, setCoupons] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const { isOpen, onOpen, onClose } = useDisclosure();


  const loadCoupons = useCallback(async (p = 0) => {
    try {
      setIsLoading(true);
      const res = await CouponService.getAll({
        page: p,
        size: 8,
        keyword: searchKeyword || undefined,
      });

      const data = res.data?.content || res.content || [];
      const pages = res.data?.totalPages || res.totalPages || 1;

      setCoupons(data);
      setTotalPages(pages);
    } catch (err) {
      console.error(err);
      toast.error('Tải danh sách mã giảm giá thất bại');
    } finally {
      setIsLoading(false);
    }

  }, [searchKeyword, toast]);

  useEffect(() => {
    loadCoupons(page);
  }, [loadCoupons, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setSearchKeyword(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);


  const handleDelete = async () => {
    try {
      await CouponService.delete(couponToDelete.id);
      toast.success('Xóa mã giảm giá thành công');
      setIsConfirmOpen(false);
      loadCoupons(page);
    } catch (err) {
      toast.error('Xóa mã giảm giá thất bại');
    }
  };


  const handleReload = () => {
    loadCoupons(page);
    onClose();
  };


  const columns = useMemo(
    () => Columns(onOpen, setEditingCoupon, setCouponToDelete, setIsConfirmOpen),
    [onOpen],
  );


  return (
    <Box>
      {}
      <Form
        isOpen={isOpen}
        onClose={() => {
          setEditingCoupon(null);
          onClose();
        }}
        reloadCoupons={handleReload}
        coupon={editingCoupon}
      />

      {}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Xóa Mã Giảm Giá"
        message={`Bạn có chắc muốn xóa mã "${couponToDelete?.code}"?`}
      />

      {}
      <Card w="100%" borderRadius="16px" boxShadow="md" bg={bgColor}>
        <Header
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onOpen={onOpen}
        />

        <List
          coupons={coupons}
          columns={columns}
          borderColor={borderColor}
          headerBg={headerBg}
          isLoading={isLoading}
        />
      </Card>

      {!isLoading && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </Box>
  );
}
