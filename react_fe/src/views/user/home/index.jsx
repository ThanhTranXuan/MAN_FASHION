// src/views/user/home/Home.jsx
import React, { useEffect } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

import HeroSection from './components/HeroSection';
import CollectionGridSection from './components/CollectionGridSection';
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
    { title: 'Gợi Ý Phối Đồ Mùa Này', categorySlug: '', sort: 'price-asc', limit: 12 },
    { title: 'Sản Phẩm Nổi Bật', categorySlug: '', sort: 'price-desc', limit: 15 },
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

  const navigationType = useNavigationType();

  // SCROLL RESTORATION CHO TRANG CHỦ
  useEffect(() => {
    // Nếu là PUSH (chuyển trang mới) -> scroll lên top
    // Nếu là POP (Back/Forward) -> restore vị trí cũ
    const storageKey = `scroll:${location.pathname}`;
    let restoreTimer;
    let frameId;

    if (navigationType === 'POP') {
      const savedY = Number(sessionStorage.getItem(storageKey) || 0);
      if (savedY > 0) {
        restoreTimer = window.setTimeout(() => {
          frameId = window.requestAnimationFrame(() => {
            window.scrollTo({ top: savedY, left: 0, behavior: 'auto' });
          });
        }, 120);
      }
    } else if (!location.search) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    const handleScroll = () => {
      sessionStorage.setItem(storageKey, String(window.scrollY));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      handleScroll();
      window.clearTimeout(restoreTimer);
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname, location.search, navigationType]);

  return (
    <Box
      pt={{ base: '80px', md: '100px' }}
      pb="20"
      bg={bgColor}
      minH="100vh"
    >
      <HeroSection textColor={textColor} />
      <CollectionGridSection />
      <AboutSection textColor={textColor} />
      <FeaturesSection />

      {mainCategories.map((cat) => (
        <ProductSliderSection
          key={cat.title}
          title={cat.title}
          categorySlug={cat.categorySlug}
          sort={cat.sort || 'newest'}
          limit={cat.limit}
        />
      ))}

      <BlogSliderSection />
      <SubscribeSection bgColor="transparent" textColor={textColor} />
    </Box>
  );
}
