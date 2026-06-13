// src/views/profile/ProfilePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  useColorModeValue,
  Flex,
  Circle,
} from '@chakra-ui/react';

import OrderService from 'services/OrderService';
import ReturnOrderService from 'services/ReturnOrderService';
import ProductService from 'services/ProductService';
import { useAppToast } from 'utils/ToastHelper';
import { resolveImageUrl } from 'utils/ImageHelper';

import ProfileTab from './components/ProfileTab';
import PasswordTab from './components/PasswordTab';
import DeleteAccountTab from './components/DeleteAccountTab';
import PurchaseHistoryTab from './components/PurchaseHistoryTab';
import ReturnOrderTab from './components/ReturnOrderTab';

import { useUser } from 'contexts/UserContext';
import { useNotification } from 'contexts/NotificationContext';

export default function ProfilePage() {
  const { user, isAuthenticated, loadingUser, logout } = useUser();
  const {
    hasProfileOrderUpdate,
    hasProfileReturnUpdate,
    refreshOrderSignal,
    refreshReturnSignal,
    clearProfileNotification,
  } = useNotification();

  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingReturns, setLoadingReturns] = useState(true);

  // Pagination cho orders
  const [orderPage, setOrderPage] = useState(0);
  const [orderHasMore, setOrderHasMore] = useState(true);
  const [orderLoadingMore, setOrderLoadingMore] = useState(false);

  // Pagination cho returns
  const [returnPage, setReturnPage] = useState(0);
  const [returnHasMore, setReturnHasMore] = useState(true);
  const [returnLoadingMore, setReturnLoadingMore] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const toast = useAppToast();
  const bgColor = useColorModeValue('white', 'navy.800');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const borderColor = useColorModeValue('rgba(11,20,55,0.1)', 'navy.600');

  // Cache sản phẩm dùng useRef để không reset mỗi lần render
  const productCacheRef = useRef({});

  // -------------------------------
  // Fetch Orders (có hỗ trợ append)
  // -------------------------------
  const fetchOrders = useCallback(
    async (page = 0, append = false) => {
      try {
        if (append) {
          setOrderLoadingMore(true);
        } else {
          setLoadingOrders(true);
          setOrderPage(0);
          setOrderHasMore(true);
        }

        const res = await OrderService.getMyOrders({ page, size: 10 });
        const data = res.data?.content || [];

        const enriched = await Promise.all(
          data.map(async (order) => {
            const items = await Promise.all(
              order.items.map(async (item) => {
                try {
                  const cache = productCacheRef.current;
                  if (!cache[item.productId]) {
                    const { data: product } =
                      await ProductService.getDetailById(item.productId);
                    cache[item.productId] = product;
                  }

                  const product = cache[item.productId];
                  const variant = product.variants?.find(
                    (v) => v.id === item.variantId,
                  );

                  const img = resolveImageUrl(
                    item.imageUrl,
                    item.thumbnailUrl,
                    variant?.imageUrl,
                    product.images?.find((img) => img.color === variant?.color)
                      ?.url,
                    product.thumbnailUrl,
                  );

                  return {
                    ...item,
                    productName: item.productName || product.name,
                    color: item.color || variant?.color,
                    size: item.size || variant?.size,
                    thumbnailUrl: img,
                    imageUrl: img,
                  };
                } catch {
                  // Nếu lỗi thì cứ trả item gốc
                  return {
                    ...item,
                    thumbnailUrl: resolveImageUrl(item.imageUrl, item.thumbnailUrl),
                  };
                }
              }),
            );
            return { ...order, items };
          }),
        );

        setOrders((prev) => (append ? [...prev, ...enriched] : enriched));
        setOrderPage(page);

        const isLast = res.data?.last || data.length === 0 || data.length < 10; // fallback nếu BE không trả "last"

        if (isLast) {
          setOrderHasMore(false);
        }

        // Trả về list orders đã enrich để dùng cho fetchReturns lần đầu
        return append ? [] : enriched;
      } catch (err) {
        console.error(err);
        toast.error('Tải đơn hàng thất bại');
        throw err;
      } finally {
        if (append) {
          setOrderLoadingMore(false);
        } else {
          setLoadingOrders(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // -------------------------------
  // Fetch Return Orders (có append)
  // -------------------------------
  const fetchReturns = useCallback(
    async (page = 0, append = false, sourceOrders = null) => {
      try {
        if (append) {
          setReturnLoadingMore(true);
        } else {
          setLoadingReturns(true);
          setReturnPage(0);
          setReturnHasMore(true);
        }

        const res = await ReturnOrderService.getMyReturns({
          page,
          size: 10,
        });
        const data = res.data?.content || [];

        const ordersForMap = sourceOrders || orders;

        const orderItemMap = new Map();
        ordersForMap.forEach((o) =>
          o.items.forEach((it) => {
            const key = String(it.orderItemId || it.id || it._id);
            orderItemMap.set(key, it);
          }),
        );

        const enriched = data.map((r) => {
          const mappedItems = r.items.map((i) => {
            const key = String(i.orderItemId || i.id);
            const match = orderItemMap.get(key);

            return match
              ? {
                  ...i,
                  productName: match.productName,
                  thumbnailUrl: match.thumbnailUrl,
                  color: match.color,
                  size: match.size,
                }
              : {
                  ...i,
                  productName: i.productName || 'Product',
                  thumbnailUrl: i.thumbnailUrl || '',
                };
          });
          return { ...r, items: mappedItems };
        });

        setReturns((prev) => (append ? [...prev, ...enriched] : enriched));
        setReturnPage(page);

        const isLast = res.data?.last || data.length === 0 || data.length < 10;

        if (isLast) {
          setReturnHasMore(false);
        }
      } catch (err) {
        console.error(err);
        toast.error('Tải đơn hoàn trả thất bại');
        throw err;
      } finally {
        if (append) {
          setReturnLoadingMore(false);
        } else {
          setLoadingReturns(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // -------------------------------
  // Load more handlers (scroll)
  // -------------------------------
  const loadMoreOrders = () => {
    if (loadingOrders || orderLoadingMore || !orderHasMore) return;
    fetchOrders(orderPage + 1, true);
  };

  const loadMoreReturns = () => {
    if (loadingReturns || returnLoadingMore || !returnHasMore) return;
    fetchReturns(returnPage + 1, true);
  };

  // -------------------------------
  // Load initial data (user + orders + returns)
  // -------------------------------
  useEffect(() => {
    if (loadingUser) return;

    if (!isAuthenticated || !user) {
      logout();
      window.location.href = '/auth/sign-in';
      return;
    }

    const init = async () => {
      try {
        const firstOrders = await fetchOrders(0, false);
        await fetchReturns(0, false, firstOrders);
      } catch {
        // lỗi đã toast trong từng hàm
      }
    };

    init();
  }, [loadingUser, isAuthenticated, user, fetchOrders, fetchReturns, logout]);

  useEffect(() => {
    if (!refreshOrderSignal || !isAuthenticated) {
      return;
    }

    fetchOrders(0, false);
  }, [refreshOrderSignal, isAuthenticated, user?.roleName, fetchOrders]);

  useEffect(() => {
    if (!refreshReturnSignal || !isAuthenticated) {
      return;
    }

    const refreshReturns = async () => {
      const currentOrders = await fetchOrders(0, false);
      await fetchReturns(0, false, currentOrders);
    };

    refreshReturns();
  }, [
    refreshReturnSignal,
    isAuthenticated,
    user?.roleName,
    fetchOrders,
    fetchReturns,
  ]);

  // Callback khi tạo return xong -> reload lại từ đầu
  const handleReturnSubmitted = async () => {
    try {
      const firstOrders = await fetchOrders(0, false);
      await fetchReturns(0, false, firstOrders);
    } catch {
      // ignore
    }
  };

  // -------------------------------
  // Role logic
  // -------------------------------
  const roleName = user?.roleName || 'GUEST';
  const isAdminOrEmployee = roleName === 'ADMIN' || roleName === 'EMPLOYEE';

  // -------------------------------
  // Tabs hiển thị theo role
  // -------------------------------
  const tabs = [
    {
      label: 'Lịch Sử Mua Hàng',
      component: (
        <PurchaseHistoryTab
          orders={orders}
          onReturnSubmitted={handleReturnSubmitted}
          onRefresh={handleReturnSubmitted}
          isLoading={loadingOrders}
          onLoadMore={loadMoreOrders}
          hasMore={orderHasMore}
          loadingMore={orderLoadingMore}
        />
      ),
    },
    {
      label: 'Đơn Hoàn Trả',
      component: (
        <ReturnOrderTab
          returns={returns}
          isLoading={loadingReturns}
          onLoadMore={loadMoreReturns}
          hasMore={returnHasMore}
          loadingMore={returnLoadingMore}
        />
      ),
    },
    { label: 'Hồ Sơ', component: user && <ProfileTab user={user} /> },
    { label: 'Đổi Mật Khẩu', component: <PasswordTab /> },
    !isAdminOrEmployee && {
      label: 'Xóa Tài Khoản',
      component: <DeleteAccountTab />,
    },
  ].filter(Boolean);

  return (
    <Box
      py={10}
      w={{ base: '100%', md: '80%' }}
      mx="auto"
    >
      <Tabs
        index={tabIndex}
        onChange={(index) => {
          setTabIndex(index);
          if (index === 0) clearProfileNotification('order');
          if (index === 1) clearProfileNotification('return');
        }}
        variant="unstyled"
        orientation={{ base: 'horizontal', md: 'vertical' }}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        shadow="lg"
        minH={{ base: 'auto', md: '600px' }}
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          w="100%"
          align="stretch"
        >
          {/* === TabList === */}
          <TabList
            flexDirection={{ base: 'row', md: 'column' }}
            overflowX={{ base: 'auto', md: 'visible' }}
            borderRight={{ base: 'none', md: '1px solid' }}
            borderBottom={{ base: '1px solid', md: 'none' }}
            borderColor={borderColor}
            bg={bgColor}
            sx={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.label}
                flexShrink={0}
                minW={{ base: '140px', md: '200px' }}
                py={{ base: 3, md: 4 }}
                px={{ base: 4, md: 3 }}
                justifyContent="center"
                fontSize={{ base: 'sm', md: 'md' }}
                fontWeight="medium"
                _selected={{
                  color: brandColor,
                  fontWeight: 'bold',
                  borderBottom: { base: '2px solid', md: 'none' },
                  borderRight: { base: 'none', md: '2px solid' },
                  borderColor: brandColor,
                }}
              >
                <Flex align="center" gap={2}>
                  {tab.label}
                  {((index === 0 && hasProfileOrderUpdate) ||
                    (index === 1 && hasProfileReturnUpdate)) && (
                    <Circle size="8px" bg="red.400" flexShrink={0} />
                  )}
                </Flex>
              </Tab>
            ))}
          </TabList>

          {/* === TabPanels === */}
          <TabPanels
            w="100%"
            p={{ base: 0, md: 6 }}
            bg={bgColor}
            overflowX="hidden"
          >
            {tabs.map((tab) => (
              <TabPanel key={tab.label}>{tab.component}</TabPanel>
            ))}
          </TabPanels>
        </Flex>
      </Tabs>
    </Box>
  );
}
