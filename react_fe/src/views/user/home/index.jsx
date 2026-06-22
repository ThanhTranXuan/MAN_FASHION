import React, { useEffect } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

import HeroSection from './components/HeroSection';
import MarqueeStatement from './components/MarqueeStatement';
import CollectionGridSection from './components/CollectionGridSection';
import FeaturesSection from './components/FeaturesSection';
import FashionShowcaseSection from './components/FashionShowcaseSection';
import ProductSliderSection from './components/ProductSliderSection';
import SubscribeSection from './components/SubscribeSection';

import { useCart } from 'contexts/CartContext';
import { useAppToast } from 'utils/ToastHelper';

export default function Home() {
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('#F6F0E8', 'gray.900');

  const mainCategories = [
    { title: 'Sản phẩm nổi bật', categorySlug: '', sort: 'price-desc', limit: 15 },
    { title: 'Hàng mới về', sort: 'newest', limit: 15 },
  ];

  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const toast = useAppToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderCode = params.get('orderCode');
    const code = params.get('code');
    const status = params.get('status');
    const cancel = params.get('cancel');

    if (!orderCode) return;

    if (status === 'PAID' && code === '00' && cancel === 'false') {
      clearCart();
      toast.success('Thanh toán thành công! Đơn hàng đã được đặt.');
    } else if (cancel === 'true') {
      toast.info('Thanh toán đã bị hủy. Đơn hàng chưa được hoàn tất.');
    } else {
      toast.warning('Không thể xác nhận trạng thái thanh toán.');
    }

    navigate('/user/home', { replace: true });
  }, [location.search, clearCart, navigate, toast]);

  const navigationType = useNavigationType();

  useEffect(() => {
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
    <Box pb="20" bg={bgColor} color={textColor} minH="100vh">
      <HeroSection />
      <MarqueeStatement />
      <CollectionGridSection />
      <FashionShowcaseSection />

      {mainCategories.map((cat) => (
        <ProductSliderSection
          key={cat.title}
          title={cat.title}
          categorySlug={cat.categorySlug}
          sort={cat.sort || 'newest'}
          limit={cat.limit}
        />
      ))}

      <FeaturesSection />
      <SubscribeSection />
    </Box>
  );
}
