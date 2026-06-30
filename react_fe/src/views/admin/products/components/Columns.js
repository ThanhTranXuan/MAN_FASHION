import { createColumnHelper } from '@tanstack/react-table';
import { Text } from '@chakra-ui/react';
import CategoryFilter from 'views/admin/products/components/CategoryFilter';
import ActiveFilter from 'views/admin/products/components/ActiveFilter';
import { formatCurrencyVND } from 'utils/FormatHelper';

const columnHelper = createColumnHelper();

export default function Columns({
  categories,
  categoryFilter,
  setCategoryFilter,
  activeFilter,
  setActiveFilter,
  bgColor,
  borderColor,
  brandColor,
}) {
  const getCategoryName = (id) => {
    const c = categories.find((cat) => cat.id === id);
    return c ? c.name : '-';
  };

  const columns = [

    columnHelper.accessor('thumbnail', {
      header: 'ẢNH',
      cell: (info) => (
        <Text fontWeight="600" fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),


    columnHelper.accessor('name', {
      header: 'TÊN',
      cell: (info) => (
        <Text fontWeight="600" fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),


    columnHelper.accessor('price', {
      header: 'GIÁ',
      cell: (info) => (
        <Text>{formatCurrencyVND(info.getValue())}</Text>
      ),
    }),


    columnHelper.accessor('categoryId', {
      header: () => (
        <CategoryFilter
          categories={categories}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          bgColor={bgColor}
          borderColor={borderColor}
          brandColor={brandColor}
        />
      ),
      cell: (info) => (
        <Text fontSize="sm">{getCategoryName(info.getValue())}</Text>
      ),
    }),


    columnHelper.accessor('isActive', {
      header: () =>
        <ActiveFilter
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />,
      cell: (info) =>
        <Text color={info.getValue() ? 'green.400' : 'red.400'}>
          {info.getValue() ? 'Hoạt Động' : 'Ngưng Hoạt Động'}
        </Text>,
    }),


    columnHelper.display({
      id: 'actions',
      header: <Text align="right">THAO TÁC</Text>,
    }),
  ];


  return columns.filter(Boolean);
}
