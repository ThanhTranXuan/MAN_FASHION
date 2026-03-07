import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Card, useDisclosure, useColorModeValue } from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';

import Columns from './components/Columns';
import Header from './components/Header';
import List from './components/List';
import Pagination from 'components/pagination/Pagination';
import ConfirmDialog from 'components/dialog/ConfirmDialog';
import BlogService from 'services/BlogService';
import Form from './components/Form';
import Detail from './components/Detail';
import ImagePreview from 'components/img/ImagePreview';

export default function BlogPage() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const toast = useAppToast();

  // 🧠 State
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [editingBlog, setEditingBlog] = useState(null);
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [detailBlog, setDetailBlog] = useState(null);
  const [previewImage, setPreviewImage] = useState([]);

  // 🎛️ Disclosures
  const formDialog = useDisclosure();
  const confirmDialog = useDisclosure();
  const detailDialog = useDisclosure();
  const imageDialog = useDisclosure();

  // 📦 Load Blogs
  const loadBlogs = useCallback(
    async (p = 0) => {
      try {
        const res = await BlogService.getAll({
          page: p,
          size: 10,
          keyword: searchInput || undefined,
        });
        const data = res.data?.content || res.content || [];
        setBlogs(data);
        setTotalPages(res.data?.totalPages || res.totalPages || 1);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load blogs');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchInput],
  );

  useEffect(() => {
    loadBlogs(page);
  }, [page, loadBlogs]);

  // 🗑️ Delete Handler
  const confirmDelete = async () => {
    if (!selectedToDelete) return;
    try {
      await BlogService.delete(selectedToDelete.id);
      toast.success('Blog deleted successfully');
      loadBlogs(page);
    } catch (err) {
      toast.error('Error deleting blog');
    } finally {
      confirmDialog.onClose();
    }
  };

  // 🧱 Columns
  const columns = useMemo(
    () =>
      Columns({
        onShowDetails: (blog) => {
          setDetailBlog(blog);
          detailDialog.onOpen();
        },
        onEdit: (blog) => {
          setEditingBlog(blog);
          formDialog.onOpen();
        },
        onDelete: (blog) => {
          setSelectedToDelete(blog);
          confirmDialog.onOpen();
        },
        onPreviewImage: (img) => {
          setPreviewImage(Array.isArray(img) ? img : [img]);
          imageDialog.onOpen();
        },
      }),
    [detailDialog, formDialog, confirmDialog, imageDialog],
  );

  // 📋 React Table
  const table = useReactTable({
    data: blogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 🖼️ Render
  return (
    <Box>
      {/* 📝 Form Add/Edit */}
      <Form
        isOpen={formDialog.isOpen}
        onClose={() => {
          setEditingBlog(null);
          formDialog.onClose();
        }}
        reloadBlogs={() => loadBlogs(page)}
        blog={editingBlog}
      />

      {/* 🔍 Blog Detail */}
      <Detail
        isOpen={detailDialog.isOpen}
        onClose={detailDialog.onClose}
        blog={detailBlog}
        textColor={textColor}
        bgColor={bgColor}
      />

      {/* 🖼️ Image Preview */}
      <ImagePreview
        isOpen={imageDialog.isOpen}
        onClose={imageDialog.onClose}
        images={previewImage}
      />

      {/* 🧾 Main Table */}
      <Card
        flexDirection="column"
        w="100%"
        borderRadius="16px"
        boxShadow="md"
        bg={bgColor}
      >
        <Header
          title="Blog Management"
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onAdd={() => {
            setEditingBlog(null);
            formDialog.onOpen();
          }}
        />
        <List table={table} data={blogs} />
      </Card>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* ⚠️ Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.onClose}
        onConfirm={confirmDelete}
        title="Delete Blog"
        message={`Are you sure you want to delete "${selectedToDelete?.title}"?`}
      />
    </Box>
  );
}
