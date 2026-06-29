import React from 'react';
import { Box, useDisclosure, useColorModeValue } from '@chakra-ui/react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import NavbarUser from 'components/navbar/NavbarUser';
import FooterUser from 'components/footer/FooterUser';
import routes from 'routes.js';
import PrivateRoute from 'components/auth/PrivateRoute';
import ChatWidget from "components/chat/ChatWidget";

const MotionBox = motion(Box);

const shouldHideChatbot = (pathname) =>
  pathname.startsWith('/cart') ||
  pathname.startsWith('/checkout') ||
  pathname.startsWith('/profile') ||
  pathname.startsWith('/account') ||
  pathname.startsWith('/user/profile') ||
  pathname.startsWith('/user/account') ||
  pathname.startsWith('/orders') ||
  pathname.startsWith('/order-history') ||
  pathname.startsWith('/search') ||
  pathname.startsWith('/menu');

export default function UserLayout() {
  const bgColor = useColorModeValue('fashion.pageBg', 'navy.900');
  const { isOpen, onToggle } = useDisclosure();
  const location = useLocation();
  const hideChatbot = shouldHideChatbot(location.pathname) || isOpen;
  const isProductDetail = location.pathname.includes('/product/detail/');

  const getRoutesComponents = (routes) =>
    routes.map((route, key) => {
      if (route.collapse || route.category) {
        return getRoutesComponents(route.items);
      }
      if (route.layout === '/user' || !route.role) {
        return (
          <Route
            key={key}
            path={route.path}
            element={
              route.private ? (
                <PrivateRoute>{route.component}</PrivateRoute>
              ) : (
                route.component
              )
            }
          />
        );
      }
      return null;
    });

  return (
    <Box minH="100vh" bg={bgColor}>
      {}
      <NavbarUser isOpen={isOpen} onToggle={onToggle} />

      {}
      <Box mx="auto" minH="100vh" pt="0">
        <AnimatePresence mode="wait" initial={false}>
          <MotionBox
            key={location.pathname}
            initial={isProductDetail ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={isProductDetail ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: isProductDetail ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              {getRoutesComponents(routes)}
              <Route path="/" element={<Navigate to="/user/home" replace />} />
            </Routes>
          </MotionBox>
        </AnimatePresence>
      </Box>

      {}
      <FooterUser />

      {}
      <ChatWidget hidden={hideChatbot} />
    </Box>
  );
}
