import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, Grid, Heading, Spinner, Text } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import ProductService from 'services/ProductService';
import ProductCard from 'views/user/product/components/ProductCard';
import { Link, useNavigate } from 'react-router-dom';
import AppContainer from 'components/ui/AppContainer';
import SectionHeader from 'components/ui/SectionHeader';

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
  const isEditorial = sort === 'price-desc';

  const cacheKey = useMemo(
    () => JSON.stringify({ categorySlug: categorySlug || 'all', sort, limit }),
    [categorySlug, sort, limit],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const cached = productCache.get(cacheKey);

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
        productCache.set(cacheKey, data);
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

  if (loading && !products.length) {
    return (
      <Flex justify="center" py={12}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }

  if (products.length === 0) return null;

  if (isEditorial) {
    const [featured, ...rest] = products;
    const quickPicks = rest.slice(0, 4);

    return (
      <Box bg="#F6F0E8" py={{ base: 12, md: 20 }}>
        <AppContainer>
          <Grid templateColumns={{ base: '1fr', lg: '0.92fr 1.08fr' }} gap={{ base: 8, lg: 12 }}>
            <Box>
              <Text
                color="#F97316"
                fontSize="xs"
                fontWeight="950"
                letterSpacing="0.18em"
                textTransform="uppercase"
                mb={4}
              >
                Đáng chú ý
              </Text>
              <Heading
                fontSize={{ base: '4xl', md: '6xl', xl: '7xl' }}
                lineHeight={{ base: '1.14', md: '1.08' }}
                letterSpacing={{ base: '-0.02em', md: '-0.035em' }}
                color="#0B0B0B"
                mb={{ base: 7, md: 8 }}
              >
                Một món chủ lực, nhiều cách mặc.
              </Heading>
              <Text maxW="520px" color="#4B5563" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.8">
                Từ áo thun, sơ mi đến quần ống rộng, những item dễ phối giúp
                bạn đổi vibe mà không cần nghĩ quá nhiều.
              </Text>
              <Button
                as={Link}
                to="/user/product"
                mt={8}
                bg="#0B0B0B"
                color="white"
                borderRadius="0"
                h="52px"
                px={8}
                _hover={{ bg: '#F97316' }}
              >
                Xem tất cả
              </Button>
            </Box>

            <Grid templateColumns={{ base: '1fr', md: '1.05fr 0.95fr' }} gap={5} alignItems="stretch">
              <Box
                p={{ base: 3, md: 4 }}
                bg="white"
                border="1px solid"
                borderColor="blackAlpha.200"
                transform={{ md: 'rotate(-1.5deg)' }}
              >
                <ProductCard
                  product={featured}
                  variant="home"
                  onClick={() => navigate(`/user/product/detail/${featured.slug}`)}
                />
              </Box>

              <Flex direction="column" gap={4}>
                {quickPicks.map((product, index) => (
                  <Flex
                    key={product.id}
                    as="button"
                    type="button"
                    onClick={() => navigate(`/user/product/detail/${product.slug}`)}
                    align="center"
                    gap={4}
                    textAlign="left"
                    p={4}
                    minH="118px"
                    bg={index % 2 === 0 ? '#0B0B0B' : 'white'}
                    color={index % 2 === 0 ? 'white' : '#0B0B0B'}
                    border="1px solid"
                    borderColor={index % 2 === 0 ? '#0B0B0B' : 'blackAlpha.200'}
                    _hover={{ transform: 'translateX(6px)' }}
                    transition="transform 0.2s ease"
                  >
                    <Text fontSize="2xl" fontWeight="950" color="#F97316">
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    <Box minW={0}>
                      <Text fontWeight="900" noOfLines={2}>
                        {product.name}
                      </Text>
                      <Text fontSize="sm" opacity={0.7} mt={1}>
                        Xem chi tiết
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </Flex>
            </Grid>
          </Grid>
        </AppContainer>
      </Box>
    );
  }

  return (
    <Box bg="#F2EAE0">
    <AppContainer py={{ base: 10, md: 16 }}>
      <SectionHeader
        mb={7}
        eyebrow="Mới lên kệ"
        title={title}
        description="Cập nhật những mẫu mới nhất vừa lên kệ tại Trendify."
        action={
          <Button
            as={Link}
            to={categorySlug ? `/user/product/${categorySlug}` : '/user/product'}
            variant="outline"
            size="sm"
            borderRadius="0"
            borderColor="#111827"
            color="#111827"
            _hover={{ bg: '#111827', color: 'white' }}
          >
            Xem tất cả
          </Button>
        }
      />

      <Swiper
        modules={[Autoplay]}
        spaceBetween={22}
        slidesPerView={1.35}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          768: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4.2 },
          1280: { slidesPerView: 5.2 },
        }}
        autoplay={{ delay: 4200, disableOnInteraction: false }}
        loop={products.length > 5}
      >
        {products.map((product, index) => (
          <SwiperSlide key={product.id}>
            <Box h="full">
              <ProductCard
                product={product}
                variant="home"
                onClick={() => navigate(`/user/product/detail/${product.slug}`)}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </AppContainer>
    </Box>
  );
}
