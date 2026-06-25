import React, { useMemo, useState } from 'react';
import { Box, Card, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';

import ConfirmDialog from 'components/dialog/ConfirmDialog';

import Header from './components/Header';
import List from './components/List';
import Columns from './components/Columns';
import Form from './components/Form';

import { useCategories } from 'contexts/CategoryContext';
import CategoryService from 'services/CategoryService';

export default function CategoryPage() {
  const toast = useAppToast();
  const bgColor = useColorModeValue('white', 'navy.800');

  const { categories, refreshCategories, loading } = useCategories();

  const [searchInput, setSearchInput] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  // BUILD TREE
  const buildTree = (flat) => {
    const map = {};
    flat.forEach((c) => (map[c.id] = { ...c, children: [] }));
    const roots = [];

    flat.forEach((c) => {
      if (c.parentId) map[c.parentId]?.children.push(map[c.id]);
      else roots.push(map[c.id]);
    });

    return roots;
  };

  const treeData = useMemo(() => {
    let data = categories;
    if (searchInput) {
      data = categories.filter((c) =>
        c.name.toLowerCase().includes(searchInput.toLowerCase()),
      );
    }
    return buildTree(data);
  }, [categories, searchInput]);

  const toggleExpand = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const confirmDelete = async () => {
    try {
      await CategoryService.softDelete(selectedToDelete.id);
      toast.success('Xóa danh mục thành công');
      await refreshCategories();
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error('Không thể xóa danh mục vì vẫn còn sản phẩm bên trong');
      } else {
        toast.error('Lỗi khi xóa danh mục');
      }
    } finally {
      setSelectedToDelete(null);
      onConfirmClose();
    }
  };

  const columns = useMemo(
    () =>
      Columns({
        toggleExpand,
        expandedRows,
        onEdit: (c) => {
          setEditingCategory(c);
          setParentCategory(null);
          onOpen();
        },
        onAdd: (c) => {
          setParentCategory(c);
          setEditingCategory(null);
          onOpen();
        },
        onDelete: (c) => {
          setSelectedToDelete({ id: c.id, name: c.name });
          onConfirmOpen();
        },
      }),
    [expandedRows, onConfirmOpen, onOpen],
  );

  const table = useReactTable({
    data: treeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Box>
      <Form
        isOpen={isOpen}
        onClose={() => {
          setEditingCategory(null);
          setParentCategory(null);
          onClose();
        }}
        reloadCategories={refreshCategories}
        category={editingCategory}
        parentCategory={parentCategory}
      />

      <Card flexDirection="column" w="100%" borderRadius="16px" boxShadow="md" bg={bgColor}>
        <Header
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onAdd={() => {
            setEditingCategory(null);
            setParentCategory(null);
            onOpen();
          }}
        />

        <List
          table={table}
          treeData={treeData}
          expandedRows={expandedRows}
          toggleExpand={toggleExpand}
          onAdd={(c) => {
            setParentCategory(c);
            setEditingCategory(null);
            onOpen();
          }}
          onEdit={(c) => {
            setEditingCategory(c);
            setParentCategory(null);
            onOpen();
          }}
          onDelete={(c) => {
            setSelectedToDelete({ id: c.id, name: c.name });
            onConfirmOpen();
          }}
          isLoading={loading}
        />
      </Card>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        onConfirm={confirmDelete}
        title="Xóa Danh Mục"
        message={
          selectedToDelete
            ? `Bạn có chắc muốn xóa "${selectedToDelete.name}"?`
            : 'Bạn có chắc muốn xóa không?'
        }
      />
    </Box>
  );
}
