import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Card, useColorModeValue } from '@chakra-ui/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import Pagination from 'components/pagination/Pagination';
import UserService from 'services/UserService';
import Header from 'views/admin/users/components/Header';
import List from 'views/admin/users/components/List';
import Columns from 'views/admin/users/components/Columns';
import { useAppToast } from 'utils/ToastHelper';

export default function UserPage() {
  // 🎨 UI colors
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const bgColor = useColorModeValue('white', 'navy.800');
  const toast = useAppToast();

  // 🧠 State
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 📦 Load users
  const loadUsers = useCallback(
    async (p = 0) => {
      try {
        setIsLoading(true);
        const { data } = await UserService.getAll({
          page: p,
          size: 20,
          keyword: searchInput || undefined,
        });
        setUsers(data.content || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('❌ Failed to load users:', err);
        toast.error('Tải danh sách người dùng thất bại');
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchInput],
  );

  useEffect(() => {
    loadUsers(page);
  }, [loadUsers, page]);

  // 📊 Table setup
  const columns = useMemo(
    () => Columns({ bgColor, borderColor }),
    [bgColor, borderColor],
  );

  const table = useReactTable({
    data: users,
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
        {/* 🔍 Search header */}
        <Header
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          textColor={textColor}
        />

        {/* 📋 User list */}
        <List table={table} isLoading={isLoading} textColor={textColor} />
      </Card>
      {/* 📄 Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
}
