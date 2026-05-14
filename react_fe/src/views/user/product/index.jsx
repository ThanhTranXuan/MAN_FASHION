import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  Box,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useDisclosure,
  useColorModeValue,
  Spinner,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { MdTune } from 'react-icons/md';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ProductService from 'services/ProductService';
import ProductCard from './components/ProductCard';
import FiltersDrawer from './components/FiltersDrawer';
import CategoryChips from './components/CategoryChips';
import SortMenu from './components/SortMenu';
import Pagination from 'components/pagination/Pagination';
import { useCategories } from 'contexts/CategoryContext';

export default function ProductListPage() {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // 🧩 Category context
  const { categories, loading: loadingCats } = useCategories();

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const [size, setSize] = useState(searchParams.getAll('size') || []);
  const [inStock] = useState(undefined);

  const [page, setPage] = useState(Number(searchParams.get('page') || 0));
  const [sizePerPage] = useState(20);

  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'navy.800');
  const border = useColorModeValue('gray.200', 'gray.700');

  // 🆕 Dùng để chống “chèn data” từ request cũ
  const latestRequestId = useRef(0);

  // ==========================================
  // 🔍 Debounce search
  // ==========================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  // ==========================================
  // 🔁 Reset filter khi đổi category
  // ==========================================
  useEffect(() => {
    setColor('');
    setSize([]);
    setPage(0);
  }, [categorySlug]);

  // ==========================================
  // 🧩 Build query
  // ==========================================
  const query = useMemo(
    () => ({
      keyword: debouncedKeyword || undefined,
      color: color || undefined,
      variantSize: size.length > 0 ? size : undefined,
      inStock,
      active: true,
      sort,
      page,
      size: sizePerPage,
      categorySlug: categorySlug || undefined,
    }),
    [
      debouncedKeyword,
      color,
      size,
      inStock,
      sort,
      page,
      sizePerPage,
      categorySlug,
    ],
  );

  // ==========================================
  // 🌐 Update URL params (slug nằm ở useParams)
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (color) params.set('color', color);
    if (size.length > 0) size.forEach((s) => params.append('size', s));
    if (sort) params.set('sort', sort);
    params.set('page', String(page));
    setSearchParams(params);
  }, [keyword, color, size, sort, page, setSearchParams]);

  // ==========================================
  // 📦 Fetch products – ĐÃ CHẶN REQUEST CŨ
  // ==========================================
  const fetchData = useCallback(async () => {
    const currentId = ++latestRequestId.current; // tăng id mỗi lần gọi
    setLoading(true);

    try {
      const response = await ProductService.getAll(query);

      // ❗ Nếu đã có request mới hơn → bỏ qua result này
      if (currentId !== latestRequestId.current) {
        return;
      }

      setPageData(response.data);
    } finally {
      // ❗ Chỉ tắt loading nếu đây là request mới nhất
      if (currentId === latestRequestId.current) {
        setLoading(false);
      }
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData, categorySlug]);

  // ==========================================
  // 🧭 Breadcrumbs
  // ==========================================
  const breadcrumbTrail = useMemo(() => {
    const trail = [
      { name: 'Trang Chủ', path: '/' },
      { name: 'Tất Cả Sản Phẩm', path: '/user/product' },
    ];

    if (!categorySlug || categories.length === 0) return trail;

    const catMap = new Map(categories.map((c) => [c.slug, c]));

    const build = [];
    let currentSlug = categorySlug;

    while (currentSlug) {
      const node = catMap.get(currentSlug);
      if (!node) break;
      build.unshift(node);
      currentSlug = node.parentSlug;
    }

    for (const node of build) {
      trail.push({
        name: node.name,
        path: `/user/product/${node.slug}`,
      });
    }

    return trail;
  }, [categorySlug, categories]);

  // Hàm reset filter khi đang ở empty state
  const handleClearFilters = () => {
    setKeyword('');
    setDebouncedKeyword('');
    setColor('');
    setSize([]);
    setPage(0);
    setSearchParams({});
  };

  // ==========================================
  // 🧩 RENDER
  // ==========================================
  return (
    <Box px={{ base: 4, md: 20 }} py={{ base: 5, md: 10 }}>
      {/* 🔗 Breadcrumb + Search */}
      <Flex
        mt={3}
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'flex-start', md: 'center' }}
        justify={{ base: 'flex-start', md: 'space-between' }}
        gap={{ base: 3, md: 4 }}
        w="full"
      >
        {/* 🧭 Breadcrumb */}
        <Breadcrumb
          fontWeight="medium"
          fontSize="sm"
          separator="/"
          w={{ base: '100%', md: 'auto' }}
          sx={{
            display: 'flex',
            flexWrap: 'wrap !important',
            '& > ol': {
              display: 'flex',
              flexWrap: 'wrap !important',
            },
          }}
        >
          {breadcrumbTrail.map((b, i) => {
            const isLast = i === breadcrumbTrail.length - 1;
            return (
              <BreadcrumbItem key={b.path + i} isCurrentPage={isLast}>
                <BreadcrumbLink
                  opacity={isLast ? 1 : 0.7}
                  _hover={{ opacity: 1 }}
                  onClick={() => !isLast && navigate(b.path)}
                  cursor={isLast ? 'default' : 'pointer'}
                >
                  {b.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>

        {/* 🔍 Search */}
        <Box
          borderWidth="1px"
          borderColor={border}
          borderRadius="30px"
          w={{ base: '100%', md: '300px' }}
        >
          <SearchBar
            placeholder="Tìm kiếm sản phẩm..."
            borderRadius="30px"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </Box>
      </Flex>

      {/* 🧩 Category chips */}
      {loadingCats ? (
        <Text>Đang tải danh mục...</Text>
      ) : (
        <Box
          overflowX="auto"
          mt={2}
          sx={{ '&::-webkit-scrollbar': { display: 'none' } }}
        >
          <HStack spacing={2} minW="fit-content">
            <CategoryChips
              categories={categories}
              activeSlug={categorySlug || ''}
              onSelect={(slug) => {
                setSearchParams({});
                navigate(slug ? `/user/product/${slug}` : '/user/product');
                setPage(0);
              }}
            />
          </HStack>
        </Box>
      )}

      {/* 🔽 Filters */}
      <Flex justify="space-between" align="center" mt={3}>
        <Flex align="center">
          <SortMenu sort={sort} setSort={setSort} setPage={setPage} />

          {/* 🏷️ Active filters */}
          <HStack spacing={2} ms={5} wrap="wrap">
            {color && (
              <Tag size="md" borderRadius="full">
                <Box
                  w="14px"
                  h="14px"
                  borderRadius="full"
                  bg={color}
                  border="1px solid #ccc"
                  mr={2}
                />
                <TagLabel textTransform="capitalize">{color}</TagLabel>
                <TagCloseButton onClick={() => setColor('')} />
              </Tag>
            )}
            {size.map((s) => (
              <Tag size="md" borderRadius="full" key={s}>
                <TagLabel>Kích cỡ: {s}</TagLabel>
                <TagCloseButton
                  onClick={() => setSize(size.filter((x) => x !== s))}
                />
              </Tag>
            ))}
          </HStack>
        </Flex>
        <Button leftIcon={<MdTune />} onClick={onOpen} variant="outline">
          Bộ Lọc
        </Button>
      </Flex>

      {/* 🧾 Product grid + EMPTY STATE */}
      <Box mt={4} borderRadius="xl" bg={bg}>
        {loading ? (
          <Flex align="center" justify="center" py={16}>
            <Spinner />
          </Flex>
        ) : pageData.content.length === 0 ? (
          // 🔴 EMPTY STATE
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={16}
            textAlign="center"
            px={4}
          >
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Không tìm thấy sản phẩm
            </Text>
            <Text fontSize="sm" color="gray.500" maxW="360px">
              Chúng tôi không tìm thấy sản phẩm nào phù hợp với tìm kiếm hoặc bộ lọc của bạn. Vui lòng điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.
            </Text>
            <HStack spacing={3} mt={6}>
              {(keyword || color || size.length > 0) && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Xóa Bộ Lọc
                </Button>
              )}
              <Button onClick={() => setPage(0)}>Tải Lại</Button>
            </HStack>
          </Flex>
        ) : (
          <>
            <SimpleGrid
              columns={{ base: 2, md: 4 }}
              spacing={{ base: 3, md: 5 }}
              p={{ base: 3, md: 5 }}
            >
              {pageData.content.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  activeColor={color}
                  onClick={() =>
                    navigate(`/user/product/detail/${p.slug}`, {
                      state: { product: p },
                    })
                  }
                />
              ))}
            </SimpleGrid>
            {pageData.totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={pageData.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Box>

      <FiltersDrawer
        isOpen={isOpen}
        onClose={onClose}
        values={{ color, size }}
        onApply={(v) => {
          setColor(v.color || '');
          setSize(v.size || []);
          setPage(0);
        }}
        categorySlug={categorySlug}
        categories={categories}
        onChangeCategory={(slug) => {
          setSearchParams({});
          navigate(slug ? `/user/product/${slug}` : '/user/product');
          setPage(0);
        }}
      />
    </Box>
  );
}
