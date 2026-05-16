// src/views/user/home/components/ProductSliderSection.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Text, Spinner, Flex, Button } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import ProductService from 'services/ProductService';
import ProductCard from 'views/user/product/components/ProductCard';
import { useNavigate } from 'react-router-dom';

import { Link } from 'react-router-dom';

// 🧠 Cache cho các slider sản phẩm (key theo categorySlug + sort + limit)
const productCache = new Map();

export default function ProductSliderSection({
  title,
  categorySlug,
  sort = 'newest',
  limit = 12,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Tạo cache key ổn định cho mỗi combination
  const cacheKey = useMemo(
    () => JSON.stringify({ categorySlug: categorySlug || 'all', sort, limit }),
    [categorySlug, sort, limit],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const cached = productCache.get(cacheKey);

        // ✅ Nếu có cache → hiển thị ngay, không spinner trắng
        if (cached && isMounted) {
          setProducts(cached);
          setLoading(false);
        } else {
          setLoading(true);
        }

        const res = await ProductService.getAll({
          categorySlug,
          sort,
          page: 0,
          size: limit,
          active: true,
        });

        const data = res.data.content || [];
        if (!isMounted) return;

        setProducts(data);
        productCache.set(cacheKey, data); // 🧠 cập nhật cache
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (!productCache.get(cacheKey) && isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [categorySlug, sort, limit, cacheKey]);

  // ✅ Chỉ show spinner khi chưa có data
  if (loading && !products.length) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (products.length === 0) return null;

  return (
    <Box py={10} px={{ base: 4, md: 20 }}>
      <Flex justify="space-between" align="center" mb={6}>
        <Text
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="bold"
          bgGradient="linear(to-r, #7366ff, #d633ff, #ff6a00)"
          bgClip="text"
        >
          {title}
        </Text>
        <Button
          as={Link}
          to={categorySlug ? `/user/product/${categorySlug}` : '/user/product'}
          variant="outline"
          colorScheme="brand"
          size="sm"
        >
          Xem tất cả
        </Button>
      </Flex>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={products.length > 5}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <Box h="full">
              <ProductCard
                product={product}
                onClick={() =>
                  navigate(`/user/product/detail/${product.slug}`)
                }
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
