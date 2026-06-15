import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Card,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';

import Form from './components/Form';
import Detail from './components/Detail';
import ConfirmDialog from 'components/dialog/ConfirmDialog';
import Pagination from 'components/pagination/Pagination';
import EmployeeService from 'services/EmployeeService';
import Header from './components/Header';
import List from './components/List';
import Columns from './components/Columns';

export default function EmployeePage() {
  // 🎨 UI
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const bgColor = useColorModeValue('white', 'navy.800');
  const headerBg = useColorModeValue('gray.100', 'navy.800');

  const toast = useAppToast();

  // 🧠 State
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 📦 Disclosure
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDetails,
    onOpen: onOpenDetails,
    onClose: onCloseDetails,
  } = useDisclosure();

  // 📋 Load data
  const loadEmployees = useCallback(
    async (p = 0) => {
      try {
        setIsLoading(true);
        const { data } = await EmployeeService.getAll({ p: p, size: 20 });
        setEmployees(data.content || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
        toast.error('Tải danh sách nhân viên thất bại');
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    loadEmployees(page);
  }, [page, loadEmployees]);

  // 🔍 Search filter (client-side)
  const filteredData = useMemo(() => {
    let data = employees;
    if (searchInput) {
      data = data.filter((row) =>
        ['email', 'fullName'].some((key) =>
          String(row[key] || '')
            .toLowerCase()
            .includes(searchInput.toLowerCase()),
        ),
      );
    }
    return data;
  }, [employees, searchInput]);

  // ❌ Delete employee
  const handleDelete = async () => {
    if (!employeeToDelete?.id) return;

    try {
      await EmployeeService.delete(employeeToDelete.id);
      toast.success('Đã ngừng hoạt động tài khoản nhân viên');
      setEmployees((current) =>
        current.filter((employee) => employee.id !== employeeToDelete.id),
      );
      setEmployeeToDelete(null);
      setIsConfirmOpen(false);
      await loadEmployees(page);
    } catch (err) {
      const status = err.response?.status;
      const message =
        status === 403
          ? 'Không thể xóa tài khoản này. Chỉ được xóa nhân viên khác.'
          : status === 409
            ? 'Không thể xóa nhân viên vì còn dữ liệu liên quan.'
            : 'Không thể xóa nhân viên. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  // 📊 Table columns
  const columns = useMemo(
    () =>
      Columns({
        onShow: (emp) => {
          setSelectedEmployee(emp);
          onOpenDetails();
        },
        onEdit: (emp) => {
          setEditingEmployee(emp);
          onOpen();
        },
        onDelete: (emp) => {
          setEmployeeToDelete(emp);
          setIsConfirmOpen(true);
        },
        textColor,
      }),
    [onOpen, onOpenDetails, textColor],
  );

  // 🧾 Table setup
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 🖼️ Render
  return (
    <Box>
      {/* 🧩 Form (Add/Edit) */}
      <Form
        isOpen={isOpen}
        onClose={() => {
          setEditingEmployee(null);
          onClose();
        }}
        reloadEmployees={() => loadEmployees(page)}
        editingEmployee={editingEmployee}
      />

      {/* 📋 Employee Detail */}
      <Detail
        isOpen={isOpenDetails}
        onClose={() => {
          setSelectedEmployee(null);
          onCloseDetails();
        }}
        employee={selectedEmployee}
      />

      {/* ⚠️ Confirm Delete */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Ngừng Hoạt Động Nhân Viên"
        message={`Bạn có chắc muốn ngừng hoạt động tài khoản ${employeeToDelete?.fullName}? Dữ liệu cũ vẫn được giữ lại.`}
      />

      {/* 📦 Main Table */}
      <Card
        flexDirection="column"
        w="100%"
        borderRadius="16px"
        boxShadow="md"
        bg={bgColor}
      >
        <Header
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onAdd={onOpen}
        />
        <List
          table={table}
          textColor={textColor}
          borderColor={borderColor}
          headerBg={headerBg}
          bgColor={bgColor}
          isLoading={isLoading}
        />
      </Card>

      {!isLoading && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </Box>
  );
}
