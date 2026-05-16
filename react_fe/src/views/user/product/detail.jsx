import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  SimpleGrid,
  Spinner,
  Divider,
  Image,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatUSD } from 'utils/FormatHelper';
import { useAppToast } from 'utils/ToastHelper';
import { MdLocalShipping, MdReplay, MdLock, MdChat } from 'react-icons/md';
import ImageGallery from './components/ImageGallery';
import ProductService from 'services/ProductService';
import ReviewService from 'services/ReviewService';
import { useCart } from 'contexts/CartContext';
import ReviewSection from './components/review/ReviewSection';
import { StarRating } from './components/review/ReviewItem';

// ─── RelatedProducts ────────────────────────────────────────
function RelatedProducts({ categorySlug, currentProductId }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue('white', 'navy.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const noImageBg = useColorModeValue('gray.100', 'navy.700');

  useEffect(() => {
    if (!currentProductId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await ProductService.getSimilarProducts(currentProductId, 8);
        if (!cancelled) {
          setProducts(data || []);
        }
      } catch {
        // silent fail – section không hiển thị
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentProductId]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <Box mt={16} mb={4}>
      <Text fontSize="xl" fontWeight="bold" mb={6} color={textColor}>
        Sản phẩm tương tự
      </Text>
      <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={{ base: 3, md: 5 }}>
        {products.map((p) => {
          const thumb =
            p.images?.find((i) => i.isThumbnail)?.url ||
            p.images?.[0]?.url ||
            null;
          return (
            <Box
              key={p.id}
              bg={cardBg}
              borderWidth="1px"
              borderColor={cardBorder}
              borderRadius="xl"
              overflow="hidden"
              cursor="pointer"
              onClick={() => navigate(`/user/product/detail/${p.slug}`)}
              _hover={{ boxShadow: 'lg', transform: 'translateY(-3px)' }}
              transition="all 0.22s ease"
            >
              {/* Image */}
              <Box position="relative" w="100%" pb="120%" overflow="hidden">
                {thumb ? (
                  <Image
                    src={thumb}
                    alt={p.name}
                    position="absolute"
                    top={0} left={0}
                    w="100%" h="100%"
                    objectFit="cover"
                    transition="transform 0.35s ease"
                    _groupHover={{ transform: 'scale(1.04)' }}
                  />
                ) : (
                  <Flex
                    position="absolute"
                    top={0} left={0}
                    w="100%" h="100%"
                    align="center" justify="center"
                    color={subColor} fontSize="sm"
                    bg={noImageBg}
                  >
                    No image
                  </Flex>
                )}
              </Box>
              {/* Info */}
              <Box p={3}>
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  noOfLines={2}
                  color={textColor}
                  mb={1}
                >
                  {p.name}
                </Text>
                <Text fontWeight="bold" fontSize="md" color="brand.500">
                  {formatUSD(p.price)}
                </Text>
              </Box>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}

// ─── ProductDetail ───────────────────────────────────────────
export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useAppToast();
  const { addItem } = useCart();

  const textColor = useColorModeValue('gray.800', 'white');
  const descColor = useColorModeValue('gray.600', 'gray.300');
  const brandColor = useColorModeValue('brand.500', 'brand.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const breadcrumbColor = useColorModeValue('gray.500', 'gray.400');
  const pageBg = useColorModeValue('gray.50', 'navy.900');
  const cardBg = useColorModeValue('white', 'navy.800');
  const dividerColor = useColorModeValue('gray.100', 'navy.700');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const { data } = await ProductService.getDetailBySlug(slug);
        setProduct(data);
        setActiveImage(
          data.images?.find((i) => i.isThumbnail)?.url ||
            data.images?.[0]?.url ||
            null,
        );

        // Load review summary
        try {
          const summaryRes = await ReviewService.getReviewSummary(data.id);
          setReviewSummary(summaryRes.data.data);
        } catch (err) {
          console.error('Error loading review summary:', err);
        }
      } catch {
        toast.error('Không tìm thấy sản phẩm');
        navigate('/user/product');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const variants = useMemo(() => product?.variants || [], [product]);
  const images = useMemo(() => product?.images || [], [product]);

  const colors = useMemo(() => {
    const unique = Array.from(
      new Set(variants.map((v) => v.color).filter(Boolean)),
    );
    return unique.sort((a, b) => a.localeCompare(b));
  }, [variants]);

  const allSizes = useMemo(() => {
    const unique = Array.from(
      new Set(variants.map((v) => v.size).filter(Boolean)),
    );
    const numeric = unique.every((s) => !isNaN(parseFloat(s)));
    if (numeric) return unique.sort((a, b) => parseFloat(a) - parseFloat(b));

    const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
    return unique.sort((a, b) => {
      const ia = order.indexOf(a.toUpperCase());
      const ib = order.indexOf(b.toUpperCase());
      if (ia !== -1 && ib !== -1) return ia - ib;
      return a.localeCompare(b);
    });
  }, [variants]);

  const stockMap = useMemo(() => {
    const map = {};
    variants.forEach((v) => {
      map[`${v.color}_${v.size}`] = v.stock;
    });
    return map;
  }, [variants]);

  useEffect(() => {
    if (!selectedColor || !images?.length) return;
    const colorImg = images.find(
      (img) => img.color?.toLowerCase() === selectedColor.toLowerCase(),
    );
    if (colorImg) setActiveImage(colorImg.url);
  }, [selectedColor, images]);

  useEffect(() => {
    if (selectedColor && selectedSize) {
      const exists = variants.some(
        (v) => v.color === selectedColor && v.size === selectedSize,
      );
      if (!exists) setSelectedSize('');
    }
  }, [selectedColor, selectedSize, variants]);

  const handleAddToCart = async () => {
    if (colors.length > 0 && !selectedColor)
      return toast.warning('Vui lòng chọn màu sắc.');
    if (allSizes.length > 0 && !selectedSize)
      return toast.warning('Vui lòng chọn kích thước.');

    const variant = variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize,
    );
    if (!variant) return toast.error('Lựa chọn biến thể không hợp lệ.');
    if (variant.stock <= 0) return toast.warning('Hết hàng.');

    const thumb =
      images.find((i) => i.color === selectedColor)?.url ||
      images.find((i) => i.isThumbnail)?.url ||
      images[0]?.url ||
      null;

    await addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      price: product.price,
      thumbnailUrl: thumb,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });

    toast.success('Thêm vào giỏ hàng thành công!');
  };

  const handleChatNow = () => {
    window.dispatchEvent(new Event('trendify:open-chat'));
  };

  if (loading)
    return (
      <Flex justify="center" align="center" minH="70vh">
        <Spinner size="xl" />
      </Flex>
    );

  if (!product) return null;

  // Category slug từ product để dùng cho RelatedProducts
  const relatedCategorySlug = product.categorySlug || null;

  return (
    <Box bg={pageBg} minH="100vh">
      {/* ── Container ── */}
      <Box maxW="1280px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>

        {/* ── Breadcrumb ── */}
        <Breadcrumb
          fontWeight="medium"
          fontSize="sm"
          mb={6}
          spacing="6px"
          separator="/"
          sx={{
            '& > ol': { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' },
            '& li': { display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', whiteSpace: 'normal' },
          }}
        >
          <BreadcrumbItem>
            <BreadcrumbLink color={breadcrumbColor} onClick={() => navigate('/')}>
              Trang Chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink color={breadcrumbColor} onClick={() => navigate('/user/product')}>
              Tất Cả Sản Phẩm
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color={textColor} maxW={{ base: '90vw', md: '100%' }}>
              {product.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* ── Main: Gallery + Info ── */}
        <Box
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="sm"
          overflow="hidden"
        >
          <Flex direction={{ base: 'column', md: 'row' }}>
            {/* 🖼 Gallery */}
            <Box flex={{ base: '1', md: '1.1' }} p={{ base: 4, md: 8 }}>
              <ImageGallery
                images={images}
                fallback={activeImage}
                activeImage={activeImage}
                onImageChange={(url) => setActiveImage(url)}
              />
            </Box>

            {/* Divider dọc (desktop) */}
            <Divider
              orientation="vertical"
              display={{ base: 'none', md: 'block' }}
              borderColor={dividerColor}
              h="auto"
              alignSelf="stretch"
            />

            {/* 🧾 Info Panel */}
            <VStack
              align="start"
              flex="1"
              spacing={5}
              p={{ base: 4, md: 8 }}
            >
              {/* Tên + Giá */}
              <Box>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color={textColor} lineHeight="1.2" mb={3}>
                  {product.name}
                </Text>
                <Text fontSize={{ base: 'xl', md: '2xl' }} color={brandColor} fontWeight="bold">
                  {formatUSD(product.price)}
                </Text>
                {reviewSummary && reviewSummary.totalReviews > 0 && (
                  <HStack spacing={2} mt={2}>
                    <StarRating rating={reviewSummary.averageRating} size={4} />
                    <Text fontSize="sm" fontWeight="bold">{reviewSummary.averageRating.toFixed(1)}</Text>
                    <Text fontSize="sm" color="gray.500">({reviewSummary.totalReviews})</Text>
                  </HStack>
                )}
                {reviewSummary && reviewSummary.totalReviews === 0 && (
                  <Text fontSize="xs" color="gray.400" mt={2}>Chưa có đánh giá</Text>
                )}
              </Box>

              <Divider borderColor={dividerColor} />

              {/* Mô tả */}
              {product.description && (
                <Text color={descColor} fontSize="sm" lineHeight="1.75">
                  {product.description}
                </Text>
              )}

              {/* 🎨 Colors */}
              {colors.length > 0 && (
                <Box w="100%">
                  <Text fontWeight="semibold" fontSize="sm" mb={2} color={textColor}>
                    Màu Sắc:{' '}
                    <Text as="span" fontWeight="normal" textTransform="capitalize" color={descColor}>
                      {selectedColor || '—'}
                    </Text>
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {colors.map((c) => (
                      <Tooltip key={c} label={c} textTransform="capitalize" hasArrow>
                        <Box
                          w="28px"
                          h="28px"
                          borderRadius="full"
                          borderWidth="2px"
                          borderColor={selectedColor === c ? brandColor : 'transparent'}
                          boxShadow={selectedColor === c ? `0 0 0 1px` : '0 0 0 1px rgba(0,0,0,0.15)'}
                          bg={c.toLowerCase()}
                          cursor="pointer"
                          onClick={() => setSelectedColor(c)}
                          transition="all 0.2s"
                          _hover={{ transform: 'scale(1.15)' }}
                        />
                      </Tooltip>
                    ))}
                  </HStack>
                </Box>
              )}

              {/* 📏 Sizes */}
              {allSizes.length > 0 && (
                <Box w="100%">
                  <Text fontWeight="semibold" fontSize="sm" mb={2} color={textColor}>
                    Kích Cỡ:{' '}
                    <Text as="span" fontWeight="normal" color={descColor}>{selectedSize || '—'}</Text>
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {allSizes.map((s) => {
                      const key = `${selectedColor}_${s}`;
                      const stock = stockMap[key];
                      const isInvalid =
                        !selectedColor || stock === undefined || stock <= 0;
                      return (
                        <Tooltip key={s} label={isInvalid ? 'Hết hàng' : ''} hasArrow isDisabled={!isInvalid}>
                          <Box
                            minW="44px"
                            textAlign="center"
                            borderWidth="1px"
                            borderColor={selectedSize === s ? brandColor : borderColor}
                            px={3}
                            py="6px"
                            borderRadius="md"
                            fontSize="sm"
                            fontWeight="500"
                            cursor={isInvalid ? 'not-allowed' : 'pointer'}
                            bg={selectedSize === s ? brandColor : 'transparent'}
                            color={
                              isInvalid ? 'gray.400' : selectedSize === s ? 'white' : textColor
                            }
                            opacity={isInvalid ? 0.5 : 1}
                            onClick={() => { if (!isInvalid) setSelectedSize(s); }}
                            transition="all 0.2s"
                          >
                            {s}
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </HStack>
                </Box>
              )}

              {/* 🛒 Quantity + Add to cart */}
              <Box w="100%">
                <HStack spacing={3} mt={2}>
                  <HStack
                    spacing={0}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Button
                      variant="ghost"
                      h="44px" w="44px"
                      fontSize="xl"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      −
                    </Button>
                    <Box w="46px" textAlign="center" fontWeight="semibold">
                      {quantity}
                    </Box>
                    <Button
                      variant="ghost"
                      h="44px" w="44px"
                      fontSize="xl"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    >
                      +
                    </Button>
                  </HStack>

                  <Button
                    colorScheme="brand"
                    color="white"
                    flex="1"
                    h="44px"
                    borderRadius="full"
                    fontWeight="700"
                    fontSize="sm"
                    letterSpacing="wide"
                    onClick={handleAddToCart}
                    _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                    transition="all 0.2s"
                  >
                    THÊM VÀO GIỎ HÀNG
                  </Button>
                </HStack>
              </Box>

              <Divider borderColor={dividerColor} />

              {/* 🛡️ Commitments */}
              <SimpleGrid columns={2} spacing={3} w="100%">
                <Flex align="center" gap={2}>
                  <Icon as={MdLocalShipping} boxSize={5} color={brandColor} flexShrink={0} />
                  <Text fontSize="xs" color={descColor}>
                    Giao hàng <b>3–5 ngày</b><br />
                    Miễn phí trên <b>499.000 ₫</b>
                  </Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <Icon as={MdReplay} boxSize={5} color={brandColor} flexShrink={0} />
                  <Text fontSize="xs" color={descColor}>
                    Hoàn trả <b>15 ngày</b> dễ dàng
                  </Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <Icon as={MdLock} boxSize={5} color={brandColor} flexShrink={0} />
                  <Text fontSize="xs" color={descColor}>
                    Thanh toán an toàn & bảo mật
                  </Text>
                </Flex>
                <Flex
                  align="center"
                  gap={2}
                  cursor="pointer"
                  onClick={handleChatNow}
                  _hover={{ opacity: 0.75 }}
                >
                  <Icon as={MdChat} boxSize={5} color={brandColor} flexShrink={0} />
                  <Text fontSize="xs" fontWeight="semibold" color={descColor}>
                    Cần hỗ trợ? <b>Chat ngay</b>
                  </Text>
                </Flex>
              </SimpleGrid>
            </VStack>
          </Flex>
        </Box>

        {/* ── Related products ── */}
        <RelatedProducts
          categorySlug={relatedCategorySlug}
          currentProductId={product.id}
        />

        <ReviewSection productId={product.id} slug={slug} />
      </Box>
    </Box>
  );
}
