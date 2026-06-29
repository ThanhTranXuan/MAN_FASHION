import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Card,
  SimpleGrid,
  Icon,
  useColorModeValue,
  useDisclosure,
  Skeleton,
  Text,
  Flex,
} from '@chakra-ui/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { MdCategory } from 'react-icons/md';
import { useAppToast } from 'utils/ToastHelper';

import { useCategories } from 'contexts/CategoryContext';

import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import Pagination from 'components/pagination/Pagination';
import ConfirmDialog from 'components/dialog/ConfirmDialog';
import ImagePreview from 'components/img/ImagePreview';

import Header from './components/Header';
import List from './components/List';
import Columns from './components/Columns';
import ProductForm from './components/ProductForm';
import VariantForm from './components/VariantForm';

import ProductService from 'services/ProductService';

export default function ProductPage() {
  const toast = useAppToast();

  const { categories, refreshCategories } = useCategories();

  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  const [stats, setStats] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [products, setProducts] = useState([]);
  const tableTopRef = useRef(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [parentProduct, setParentProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);

  const {
    isOpen: isProductOpen,
    onOpen: onProductOpen,
    onClose: onProductClose,
  } = useDisclosure();
  const {
    isOpen: isVariantOpen,
    onOpen: onVariantOpen,
    onClose: onVariantClose,
  } = useDisclosure();
  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
    onClose: onImageClose,
  } = useDisclosure();
  const [imageList, setImageList] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);


  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);




  const loadStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const { data } = await ProductService.getStatsByCategory();
      setStats(data || []);
    } catch {
      toast.error('Tải thống kê thất bại');
    } finally {
      setIsLoadingStats(false);
    }

  }, []);




  const loadData = useCallback(
    async (p = 0) => {
      try {
        setIsLoadingProducts(true);
        const { data } = await ProductService.getAll({
          page: p,
          keyword: searchInput || undefined,
          categorySlug: categoryFilter || undefined,
          active: activeFilter === null ? undefined : activeFilter,
          size: 10,
        });
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 1);
      } catch {
        toast.error('Tải danh sách sản phẩm thất bại');
      } finally {
        setIsLoadingProducts(false);
      }
    },

    [searchInput, categoryFilter, activeFilter],
  );

  useEffect(() => {
    loadStats();
    loadData(page);
  }, [loadStats, loadData, page]);




  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const isVariant =
        deleteItem.size !== undefined ||
        deleteItem.stock !== undefined ||
        deleteItem.color !== undefined;

      if (isVariant) {
        await ProductService.deleteVariant(deleteItem.id);
        setProducts((prev) =>
          prev.map((product) => ({
            ...product,
            variants: product.variants?.filter((variant) => variant.id !== deleteItem.id),
          })),
        );
      } else {
        await ProductService.delete(deleteItem.id);
      }

      toast.success(isVariant ? 'Xóa biến thể thành công' : 'Xóa sản phẩm thành công');
      setIsConfirmOpen(false);
      await Promise.all([loadData(page), loadStats(), refreshCategories()]);
    } catch {
      toast.error('Xóa thất bại');
    }
  };




  const toggleExpand = async (productId) => {
    setExpandedRows((prev) => ({ ...prev, [productId]: !prev[productId] }));

    const target = products.find((p) => p.id === productId);
    if (!target) return;

    if (!target.variants || target.variants.length === 0) {
      try {
        const res = await ProductService.getVariants(productId);
        const variants = res.data || res;
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, variants } : p)),
        );
      } catch {
        toast.error('Tải biến thể thất bại');
      }
    }
  };




  const columns = useMemo(
    () =>
      Columns({
        categories,
        categoryFilter,
        setCategoryFilter,
        activeFilter,
        setActiveFilter,
        bgColor,
        borderColor,
        brandColor,
      }),
    [
      categories,
      categoryFilter,
      activeFilter,
      bgColor,
      borderColor,
      brandColor,
    ],
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    tableTopRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <Box>
      {}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px" mb="20px">
        {isLoadingStats
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height="90px" borderRadius="12px" />
            ))
          : stats.map((item) => (
              <MiniStatistics
                key={item.categoryId}
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg={boxBg}
                    icon={
                      <Icon
                        as={MdCategory}
                        w="32px"
                        h="32px"
                        color={brandColor}
                      />
                    }
                  />
                }
                name={item.categoryName}
                value={item.count}
              />
            ))}
      </SimpleGrid>

      {}
      <ImagePreview
        isOpen={isImageOpen}
        onClose={onImageClose}
        images={imageList}
      />

      <ProductForm
        isOpen={isProductOpen}
        onClose={() => {
          setEditingItem(null);
          onProductClose();
        }}
        reload={async () => {
          await Promise.all([loadData(page), loadStats(), refreshCategories()]);
        }}
        editingItem={editingItem}
      />

      <VariantForm
        isOpen={isVariantOpen}
        onClose={() => {
          setEditingVariant(null);
          onVariantClose();
        }}
        reload={async () => {
          await Promise.all([loadData(page), loadStats(), refreshCategories()]);
        }}
        parentProduct={parentProduct}
        editingVariant={editingVariant}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Xóa Sản Phẩm"
        message={`Bạn có chắc muốn xóa ${deleteItem?.name}?`}
      />

      {}
      <Card
        ref={tableTopRef}
        w="100%"
        borderRadius="16px"
        boxShadow="md"
        bg={bgColor}
        minH={{ base: '520px', md: '690px' }}
        overflow="hidden"
      >
        <Header
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onAdd={onProductOpen}
        />
        <List
          table={table}
          products={products}
          expandedRows={expandedRows}
          toggleExpand={toggleExpand}
          onAddVariant={(p) => {
            setParentProduct(p);
            onVariantOpen();
          }}
          onEdit={(p) => {
            setEditingItem(p);
            onProductOpen();
          }}
          onDelete={(p) => {
            setDeleteItem(p);
            setIsConfirmOpen(true);
          }}
          onOpenImages={(p) => {
            const urls =
              p.images?.length > 0
                ? p.images.map((img) => img.url)
                : [p.thumbnailUrl];
            setImageList(urls);
            onImageOpen();
          }}
          onEditVariant={(variant, p) => {
            setEditingVariant(variant);
            setParentProduct(p);
            onVariantOpen();
          }}
          onDeleteVariant={(variant) => {
            setDeleteItem(variant);
            setIsConfirmOpen(true);
          }}
          isLoading={isLoadingProducts}
        />

        {!isLoadingProducts && products.length === 0 && (
          <Flex justify="center" py={10}>
            <Text color="gray.500" fontSize="sm">
              Không tìm thấy sản phẩm.
            </Text>
          </Flex>
        )}
      </Card>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isDisabled={isLoadingProducts}
        />
      )}
    </Box>
  );
}
