import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { useState } from 'react';
// Thêm dòng này vào đầu file src/App.js
import ResultPage from 'views/user/order/ResultPage';
import initialTheme from './theme/theme';

// 🧩 Layouts
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import UserLayout from 'layouts/user';

// 🧩 Providers
import { UserProvider } from 'contexts/UserContext';
import { CartProvider } from 'contexts/CartContext';
import { CategoryProvider } from 'contexts/CategoryContext';
import { NotificationProvider } from 'contexts/NotificationContext';
import { ChatProvider } from 'contexts/ChatContext';

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  return (
    <ChakraProvider theme={currentTheme}>
      <UserProvider>
        <CartProvider>
          <CategoryProvider>
            <NotificationProvider>
              <ChatProvider>
                <Routes>
                  {/* Đón khách khi thanh toán thành công */}
                  <Route path="/payment/success" element={<ResultPage />} />
                  
                  {/* Đón khách khi họ nhấn Huỷ thanh toán */}
                  <Route path="/payment/cancel" element={<ResultPage />} />
                  <Route path="auth/*" element={<AuthLayout />} />
                  <Route path="user/*" element={<UserLayout />} />
                  <Route
                    path="admin/*"
                    element={
                      <AdminLayout
                        theme={currentTheme}
                        setTheme={setCurrentTheme}
                      />
                    }
                  />

                  {/* Điều hướng mặc định */}
                  <Route path="/" element={<Navigate to="/user" replace />} />
                </Routes>
              </ChatProvider>
            </NotificationProvider>
          </CategoryProvider>
        </CartProvider>
      </UserProvider>
    </ChakraProvider>
  );
}
