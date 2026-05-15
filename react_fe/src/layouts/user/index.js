import React from 'react';
import { Box, useDisclosure, useColorModeValue } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavbarUser from 'components/navbar/NavbarUser';
import FooterUser from 'components/footer/FooterUser';
import routes from 'routes.js';
import PrivateRoute from 'components/auth/PrivateRoute';
import ChatWidget from "components/chat/ChatWidget";

export default function UserLayout() {
  const bgColor = useColorModeValue('white', 'navy.800');
  const { isOpen, onToggle } = useDisclosure();

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
      {/* 🧭 Navbar trên đầu (bỏ Portal để nằm trong flow layout) */}
      <NavbarUser isOpen={isOpen} onToggle={onToggle} />

      {/* 🧩 Nội dung chính */}
      <Box mx="auto" minH="100vh" pt="0">
        <Routes>
          {getRoutesComponents(routes)}
          <Route path="/" element={<Navigate to="/user/home" replace />} />
        </Routes>
      </Box>

      {/* 📍 Footer */}
      <FooterUser />

      {/* Floating Chat */}
      <ChatWidget />
    </Box>
  );
}
