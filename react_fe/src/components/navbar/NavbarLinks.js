import {
  Avatar,
  Button,
  Flex,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  Text,
  useColorModeValue,
  Box,
  Badge,
  Circle,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import { IoMdCart } from 'react-icons/io';
import React, { useState } from 'react';
import ConfirmDialog from 'components/dialog/ConfirmDialog';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from 'contexts/UserContext';
import { useCart } from 'contexts/CartContext';
import CartSidebar from 'components/cart/CartSidebar';
import { MdLogin } from 'react-icons/md';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import routes from 'routes.js';
import { goToSignIn, hideChatWidget, showChatWidget } from 'utils/NavigationHelper';
import { useNotification } from 'contexts/NotificationContext';
import { useChat } from 'contexts/ChatContext';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8080';

const resolveAvatarUrl = (...candidates) => {
  const raw = candidates.find(
    (value) => typeof value === 'string' && value.trim(),
  );

  if (!raw) return undefined;

  const value = raw.trim();
  if (value.startsWith('//')) return `https:${value}`;
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  return `${API_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
};

export default function NavbarLinks() {
  const navbarIcon = useColorModeValue('gray.600', 'white');
  const menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { cart } = useCart();
  const cartQty = cart.totalQuantity || 0;

  const { user, isAuthenticated, logout } = useUser();
  const {
    hasNewOrder,
    hasNewReturn,
    hasNewReview,
    hasProfileOrderUpdate,
    clearProfileNotification,
  } = useNotification();
  const { hasNewChat } = useChat();
  const navigate = useNavigate();
  const toast = useAppToast();

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // ✅ Trang thanh toán user/payment
  const isPaymentRoute = location.pathname.startsWith('/user/payment');

  // ✅ Guest hoặc USER mới được dùng cart
  const canUseCart = true;

  // ✅ Chỉ hiển thị cart khi:
  // - Không ở admin
  // - Không ở trang thanh toán
  // - Được phép dùng cart (guest + USER)
  const canShowCart = !isAdminRoute && !isPaymentRoute && canUseCart;
  const isStaffUser =
    isAuthenticated && ['ADMIN', 'EMPLOYEE'].includes(user?.roleName);
  const hasAdminUnread =
    isStaffUser &&
    !isAdminRoute &&
    (hasNewOrder || hasNewReturn || hasNewReview || hasNewChat);
  const hasUserOrderUnread =
    user?.roleName === 'USER' && hasProfileOrderUpdate;
  const avatarSrc = resolveAvatarUrl(
    user?.avatarUrl,
    user?.photoUrl,
    user?.photoURL,
    user?.picture,
    user?.profileImage,
    user?.imageUrl,
  );

  const handleToggleDashboard = () => {
    hideChatWidget();
    if (isAdminRoute) {
      navigate('/user');
    } else {
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    toast.success('Đăng xuất thành công!');
    logout();
    setTimeout(() => {
      navigate('/user');
      window.location.reload();
    }, 100);
  };

  const filteredRoutes = routes.filter((route) => !route.hideInSidebar);

  const adminShadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
  );

  return (
    <Flex 
      align="center" 
      gap="10px"
      bg={isAdminRoute ? menuBg : 'transparent'}
      p={isAdminRoute ? "10px" : "0"}
      borderRadius={isAdminRoute ? "30px" : "0"}
      boxShadow={isAdminRoute ? adminShadow : 'none'}
    >
      {isAdminRoute && <SidebarResponsive routes={filteredRoutes} />}

      {/* 🛒 Cart button 
          - Ẩn ở admin route
          - Ẩn ở trang thanh toán /user/payment
          - Ẩn với ADMIN / EMPLOYEE (chỉ guest + USER dùng cart) */}
      {canShowCart && (
        <>
          <Button
            variant="ghost"
            p="0"
            me={2}
            minW="unset"
            onClick={() => {
              hideChatWidget();
              setIsCartOpen(true);
            }}
            _hover={{ backgroundColor: 'transparent' }}
          >
            <Box position="relative">
              <Icon h="24px" w="24px" mt={2} color={navbarIcon} as={IoMdCart} />
              {cartQty > 0 && (
                <Badge
                  position="absolute"
                  top="-2"
                  right="-4"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  fontSize="0.6em"
                  px="10px"
                >
                  {cartQty}
                </Badge>
              )}
            </Box>
          </Button>

          <CartSidebar
            isOpen={isCartOpen}
            onClose={() => {
              setIsCartOpen(false);
              showChatWidget();
            }}
          />
        </>
      )}

      {/* 👤 User / Login */}
      {!user ? (
        <Button
          variant="ghost"
          px={{ base: 0, md: 3 }}
          me={2}
          minW="unset"
          onClick={() => goToSignIn(navigate, location)}
          _hover={{ backgroundColor: 'none' }}
        >
          <Icon h="24px" w="24px" color={navbarIcon} as={MdLogin} />
          <Text display={{ base: 'none', md: 'block' }} ms={2}>Đăng nhập</Text>
        </Button>
      ) : (
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Box position="relative">
              <Avatar
                src={avatarSrc}
                referrerPolicy="no-referrer"
                name={user?.fullName || user?.email?.split('@')[0] || 'User'}
                size="sm"
                w="40px"
                h="40px"
                cursor="pointer"
              />
              {(hasAdminUnread || hasUserOrderUnread) && (
                <Circle
                  size="10px"
                  bg={hasUserOrderUnread ? 'red.500' : 'brand.400'}
                  position="absolute"
                  top="1px"
                  right="1px"
                  border="2px solid"
                  borderColor={menuBg}
                />
              )}
            </Box>
          </PopoverTrigger>
          <PopoverContent
            mt="10px"
            borderRadius="10px"
            bg={menuBg}
            border="none"
            w={{ base: '100%', md: '180px' }}
            shadow="lg"
            motionProps={{
              variants: {
                enter: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                },
                exit: {
                  opacity: 0,
                  y: -8,
                  scale: 0.98,
                  transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
                },
              },
            }}
          >
            <PopoverHeader borderBottom="1px solid" borderColor={borderColor}>
              <Text fontSize="sm" fontWeight="700" color={textColor}>
                👋 Xin chào, {user?.fullName || user?.email?.split('@')[0]}
              </Text>
            </PopoverHeader>
            <PopoverBody>
              <Flex direction="column" gap={2}>
                {(user?.roleName === 'ADMIN' ||
                  user?.roleName === 'EMPLOYEE') && (
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    size="sm"
                    onClick={handleToggleDashboard}
                    position="relative"
                  >
                    {isAdminRoute ? 'Về Trang Web' : 'Vào Trang Quản Trị'}
                    {hasAdminUnread && (
                      <Circle
                        size="8px"
                        bg="brand.400"
                        position="absolute"
                        right="10px"
                      />
                    )}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="sm"
                  position="relative"
                  onClick={() => {
                    clearProfileNotification('order');
                    hideChatWidget();
                    navigate('/user/profile');
                  }}
                >
                  Hồ Sơ Của Bạn
                  {hasUserOrderUnread && (
                    <Circle
                      size="8px"
                      bg="red.500"
                      position="absolute"
                      right="10px"
                    />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="sm"
                  color="red.400"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Đăng xuất
                </Button>
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}

      {/* 🔒 Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Xác Nhận Đăng Xuất"
        message="Bạn có chắc chắn muốn đăng xuất không?"
      />
    </Flex>
  );
}
