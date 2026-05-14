// src/views/user/home/Home.jsx
import React, { useEffect } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import ProductSliderSection from './components/ProductSliderSection';
import BlogSliderSection from './components/BlogSliderSection';
import SubscribeSection from './components/SubscribeSection';

import { useCart } from 'contexts/CartContext';
import { useAppToast } from 'utils/ToastHelper';

export default function Home() {
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.900');

  const mainCategories = [
    { title: 'Hàng Mới Về', sort: 'newest', limit: 15 },
    { title: 'Nam', categorySlug: 'mens', limit: 12 },
    { title: 'Nữ', categorySlug: 'womens', limit: 12 },
    { title: 'Trẻ Em', categorySlug: 'kids', limit: 12 },
  ];

  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const toast = useAppToast();

  // 🔄 Xử lý callback từ PayOS khi redirect về /user/home?...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderCode = params.get('orderCode');
    const code = params.get('code');      // "00" khi thành công
    const status = params.get('status');  // "PAID"
    const cancel = params.get('cancel');  // "false" / "true"

    if (!orderCode) return;

    if (status === 'PAID' && code === '00' && cancel === 'false') {
      clearCart(); // chỉ clear FE cart, BE đã clear cart DB ở webhook
      toast.success('Thanh toán thành công! Đơn hàng đã được đặt.');
    } else if (cancel === 'true') {
      toast.info('Thanh toán đã bị hủy. Đơn hàng chưa được hoàn tất.');
    } else {
      toast.warning('Không thể xác nhận trạng thái thanh toán.');
    }

    // Dọn sạch query cho URL đẹp
    navigate('/user/home', { replace: true });
  }, [location.search, clearCart, navigate, toast]);

  return (
    <Box
      pt={{ base: '80px', md: '100px' }}
      pb="20"
      bg={bgColor}
      minH="100vh"
      overflow="hidden"
    >
      <HeroSection textColor={textColor} />
      <AboutSection textColor={textColor} />
      <FeaturesSection />

      {mainCategories.map((cat) => (
        <ProductSliderSection
          key={cat.title}
          title={cat.title}
          categorySlug={cat.categorySlug}
          sort={cat.sort || 'best-seller'}
          limit={cat.limit}
        />
      ))}

      <BlogSliderSection />
      <SubscribeSection bgColor="transparent" textColor={textColor} />
    </Box>
  );
}
