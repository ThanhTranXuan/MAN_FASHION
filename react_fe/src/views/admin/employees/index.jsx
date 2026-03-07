import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Card,
  useColorModeValue,
  useDisclosure,
  Flex,
  Button,
  Icon,
} from '@chakra-ui/react';
import { MdDownload } from 'react-icons/md';
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
import ReportService from 'services/ReportService';

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

  // 🔥 loading state cho export payroll PDF
  const [exportingPayroll, setExportingPayroll] = useState(false);

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
        toast.error('Failed to load employees');
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
    try {
      await EmployeeService.delete(employeeToDelete.id);
      toast.success('Employee deleted successfully');
      setEmployeeToDelete(null);
      setIsConfirmOpen(false);
      loadEmployees(page);
    } catch (err) {
      toast.error('Failed to delete employee');
    }
  };

  // 🧾 Export Employee Payroll PDF
  const handleExportPayrollPdf = async () => {
    try {
      setExportingPayroll(true);

      const res = await ReportService.exportEmployeePayrollPdf();

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      link.href = url;
      link.download = `employee-payroll-${month}-${year}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Employee payroll report has been downloaded.');
    } catch (err) {
      console.error('❌ Failed to export employee payroll PDF:', err);
      toast.error('Failed to export payroll report. Please try again.');
    } finally {
      setExportingPayroll(false);
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
      {/* 🔽 Nút export Payroll PDF giống dashboard */}
      <Flex justify="flex-end" mb="10px">
        <Button
          leftIcon={<Icon as={MdDownload} />}
          colorScheme="brand"
          variant="solid"
          size="sm"
          onClick={handleExportPayrollPdf}
          isLoading={exportingPayroll}
          loadingText="Exporting..."
          color="white"
        >
          Export Payroll PDF
        </Button>
      </Flex>

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
        title="Delete Employee"
        message={`Are you sure you want to delete ${employeeToDelete?.fullName}?`}
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
