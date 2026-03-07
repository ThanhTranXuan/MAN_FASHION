import { createColumnHelper } from '@tanstack/react-table';
import { Text } from '@chakra-ui/react';
import CategoryFilter from 'views/admin/products/components/CategoryFilter';
import ActiveFilter from 'views/admin/products/components/ActiveFilter';
import { formatUSD } from 'utils/FormatHelper';
import { useUser } from 'contexts/UserContext';

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
  const { user } = useUser();
  const isEmployee = user?.roleName === 'EMPLOYEE';

  const getCategoryName = (id) => {
    const c = categories.find((cat) => cat.id === id);
    return c ? c.name : '-';
  };

  const columns = [
    // === Thumbnail ===
    columnHelper.accessor('thumbnail', {
      header: 'THUMBNAIL',
      cell: (info) => (
        <Text fontWeight="600" fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),

    // === Name ===
    columnHelper.accessor('name', {
      header: 'NAME',
      cell: (info) => (
        <Text fontWeight="600" fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),

    // === Price ===
    columnHelper.accessor('price', {
      header: 'PRICE',
      cell: (info) => (
        <Text>${(formatUSD(info.getValue()) ?? 0).toFixed(2)}</Text>
      ),
    }),

    // === Category ===
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

    // === Active column (header & cell trống nếu EMPLOYEE) ===
    columnHelper.accessor('isActive', {
      header: () =>
        isEmployee ? (
          <Text fontSize="12px"></Text> // header trống
        ) : (
          <ActiveFilter
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        ),
      cell: (info) =>
        isEmployee ? (
          <Text></Text> // cell trống
        ) : (
          <Text color={info.getValue() ? 'green.400' : 'red.400'}>
            {info.getValue() ? 'Active' : 'Inactive'}
          </Text>
        ),
    }),

    // === Actions ===
    columnHelper.display({
      id: 'actions',
      header: <Text align="right">ACTIONS</Text>,
    }),
  ];

  // 🔥 Remove "false" values (khi isEmployee = true)
  return columns.filter(Boolean);
}
