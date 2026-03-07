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
    { title: 'New Arrivals', sort: 'newest', limit: 15 },
    { title: 'Men', categorySlug: 'mens', limit: 12 },
    { title: 'Women', categorySlug: 'womens', limit: 12 },
    { title: 'Kids', categorySlug: 'kids', limit: 12 },
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
      toast.success('Payment successful! Your order has been placed.');
    } else if (cancel === 'true') {
      toast.info('Payment was cancelled. Your order has not been completed.');
    } else {
      toast.warning('Payment status could not be verified.');
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
