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
  useColorMode,
  useColorModeValue,
  Box,
  Badge,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import { IoMdMoon, IoMdSunny, IoMdCart } from 'react-icons/io';
import React, { useState } from 'react';
import ConfirmDialog from 'components/dialog/ConfirmDialog';
import { useNavigate, useLocation } from 'react-router-dom';
import EmployeeService from 'services/EmployeeService';
import { useUser } from 'contexts/UserContext';
import { useCart } from 'contexts/CartContext';
import CartSidebar from 'components/cart/CartSidebar';
import { MdLogin } from 'react-icons/md';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import routes from 'routes.js';

export default function NavbarLinks() {
  const { colorMode, toggleColorMode } = useColorMode();
  const navbarIcon = useColorModeValue('gray.600', 'white');
  const menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { cart } = useCart();
  const cartQty = cart.totalQuantity || 0;

  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();
  const toast = useAppToast();

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // ✅ Trang thanh toán user/payment
  const isPaymentRoute = location.pathname.startsWith('/user/payment');

  // ✅ Guest hoặc USER mới được dùng cart
  const canUseCart = !isAuthenticated || user?.roleName === 'USER';

  // ✅ Chỉ hiển thị cart khi:
  // - Không ở admin
  // - Không ở trang thanh toán
  // - Được phép dùng cart (guest + USER)
  const canShowCart = !isAdminRoute && !isPaymentRoute && canUseCart;

  const handleToggleDashboard = () => {
    if (isAdminRoute) {
      navigate('/user');
    } else {
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.roleName === 'EMPLOYEE') {
        await EmployeeService.checkOut();
        toast.success('Logout success! Check-out recorded.');
      } else {
        toast.success('Logout success!');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to record check-out.');
    } finally {
      logout();
      setTimeout(() => {
        navigate('/user');
        window.location.reload();
      }, 100);
    }
  };

  const filteredRoutes = routes.filter((route) => !route.hideInSidebar);

  return (
    <Flex align="center" gap="10px">
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
            onClick={() => setIsCartOpen(true)}
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
            onClose={() => setIsCartOpen(false)}
          />
        </>
      )}

      {/* 🌗 Dark/Light toggle */}
      <Button
        variant="ghost"
        p="0"
        minW="unset"
        onClick={toggleColorMode}
        _hover={{ bg: 'transparent' }}
      >
        <Icon
          h="24px"
          w="24px"
          color={navbarIcon}
          as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
        />
      </Button>

      {/* 👤 User / Login */}
      {!user ? (
        <Button
          variant="ghost"
          p="0"
          me={2}
          minW="unset"
          onClick={() => navigate('/auth/sign-in')}
          _hover={{ backgroundColor: 'none' }}
        >
          <Icon h="24px" w="24px" color={navbarIcon} as={MdLogin} />
        </Button>
      ) : (
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Avatar
              src={user?.avatarUrl}
              name={user?.fullName || user?.email?.split('@')[0] || 'User'}
              size="sm"
              w="40px"
              h="40px"
              cursor="pointer"
            />
          </PopoverTrigger>
          <PopoverContent
            mt="10px"
            borderRadius="10px"
            bg={menuBg}
            border="none"
            w={{ base: '100%', md: '180px' }}
            shadow="lg"
          >
            <PopoverHeader borderBottom="1px solid" borderColor={borderColor}>
              <Text fontSize="sm" fontWeight="700" color={textColor}>
                👋 Hey, {user?.fullName || user?.email?.split('@')[0]}
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
                  >
                    {isAdminRoute ? 'Back to Website' : 'Go to Dashboard'}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="sm"
                  onClick={() => navigate('/user/profile')}
                >
                  Your Profile
                </Button>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="sm"
                  color="red.400"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Log out
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
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />
    </Flex>
  );
}
