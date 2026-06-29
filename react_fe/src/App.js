import './assets/css/App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, ChakraProvider } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';

import ResultPage from 'views/user/order/ResultPage';
import initialTheme from './theme/theme';


import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import UserLayout from 'layouts/user';


import { UserProvider } from 'contexts/UserContext';
import { CartProvider } from 'contexts/CartContext';
import { CategoryProvider } from 'contexts/CategoryContext';
import { NotificationProvider } from 'contexts/NotificationContext';
import { ChatProvider } from 'contexts/ChatContext';

import ScrollToTop from 'components/scroll/ScrollToTop';

const MotionBox = motion(Box);
const lightModeManager = {
  type: 'localStorage',
  get: () => 'light',
  set: () => {},
};

export default function Main() {
  const location = useLocation();
  const layoutKey = location.pathname.split('/')[1] || 'user';

  return (
    <ChakraProvider theme={initialTheme} colorModeManager={lightModeManager} resetCSS>
      <UserProvider>
        <CartProvider>
          <CategoryProvider>
            <NotificationProvider>
              <ChatProvider>
                <ScrollToTop />
                <AnimatePresence mode="wait" initial={false}>
                  <MotionBox
                    key={layoutKey}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Routes location={location}>
                  {}
                  <Route path="/payment/success" element={<ResultPage />} />

                  {}
                  <Route path="/payment/cancel" element={<ResultPage />} />
                  <Route path="auth/*" element={<AuthLayout />} />
                  <Route path="user/*" element={<UserLayout />} />
                  <Route
                    path="admin/*"
                    element={
                      <AdminLayout />
                    }
                  />

                  {}
                  <Route path="/" element={<Navigate to="/user" replace />} />
                    </Routes>
                  </MotionBox>
                </AnimatePresence>
              </ChatProvider>
            </NotificationProvider>
          </CategoryProvider>
        </CartProvider>
      </UserProvider>
    </ChakraProvider>
  );
}
