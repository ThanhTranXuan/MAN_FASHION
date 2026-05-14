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
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatUSD } from 'utils/FormatHelper';
import { useAppToast } from 'utils/ToastHelper';
import { MdLocalShipping, MdReplay, MdLock, MdChat } from 'react-icons/md';
import ImageGallery from './components/ImageGallery';
import ProductService from 'services/ProductService';
import { useCart } from 'contexts/CartContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useAppToast();
  const { addItem } = useCart();

  const textColor = useColorModeValue('gray.800', 'white');
  const descColor = useColorModeValue('gray.600', 'gray.300');
  const brandColor = useColorModeValue('brand.500', 'brand.300');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const breadcrumbColor = useColorModeValue('gray.500', 'gray.400');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await ProductService.getDetailBySlug(slug);
        setProduct(data);
        setActiveImage(
          data.images?.find((i) => i.isThumbnail)?.url ||
            data.images?.[0]?.url ||
            null,
        );
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

  // 👉 Hàm mở ChatWidget
  const handleChatNow = () => {
    // bắn event cho ChatWidget
    window.dispatchEvent(new Event('trendify:open-chat'));
  };

  if (loading)
    return (
      <Flex justify="center" align="center" minH="70vh">
        <Spinner size="xl" />
      </Flex>
    );

  if (!product) return null;

  return (
    <Box px={{ base: 4, md: 20 }} py={{ base: 5, md: 10 }} color={textColor}>
      <Breadcrumb
        fontWeight="medium"
        fontSize="sm"
        mb={6}
        spacing="6px"
        maxW="100%"
        separator="/"
        sx={{
          display: 'flex',
          flexWrap: 'wrap !important', // ✅ ép wrap
          whiteSpace: 'normal',
          '& > ol': {
            display: 'flex',
            flexWrap: 'wrap !important', // ✅ ép danh sách breadcrumb xuống dòng
            alignItems: 'center',
            gap: '4px',
            lineHeight: '1.6',
          },
          '& li': {
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            whiteSpace: 'normal',
            maxWidth: '100%',
          },
        }}
      >
        <BreadcrumbItem>
          <BreadcrumbLink
            color={breadcrumbColor}
            onClick={() => navigate('/')}
            whiteSpace="normal"
          >
            Trang Chủ
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink
            color={breadcrumbColor}
            onClick={() => navigate('/user/product')}
            whiteSpace="normal"
          >
            Tất Cả Sản Phẩm
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            color={textColor}
            display="inline-block"
            whiteSpace="normal"
            wordBreak="keep-all"
            maxW={{ base: '90vw', md: '100%' }} // ✅ giới hạn chiều ngang mobile
          >
            {product.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Flex mt={4} direction={{ base: 'column', md: 'row' }} gap={10}>
        {/* 🖼 Gallery */}
        <Box flex="1">
          <ImageGallery
            images={images}
            fallback={activeImage}
            activeImage={activeImage}
            onImageChange={(url) => setActiveImage(url)}
          />
        </Box>

        {/* 🧾 Info */}
        <VStack align="start" flex="1" spacing={5}>
          <Text fontSize="3xl" fontWeight="bold">
            {product.name}
          </Text>
          <Text color={descColor}>{product.description}</Text>
          <Text fontSize="2xl" color={brandColor} fontWeight="bold">
            {formatUSD(product.price)}
          </Text>

          {/* 🎨 Colors */}
          {colors.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={2}>
                Màu Sắc:
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {colors.map((c) => (
                  <Tooltip key={c} label={c} textTransform="capitalize">
                    <Box
                      w="28px"
                      h="28px"
                      borderRadius="full"
                      borderWidth="2px"
                      borderColor={
                        selectedColor === c ? brandColor : borderColor
                      }
                      bg={c.toLowerCase()}
                      cursor="pointer"
                      onClick={() => setSelectedColor(c)}
                      transition="all 0.2s"
                    />
                  </Tooltip>
                ))}
              </HStack>
            </Box>
          )}

          {/* 📏 Sizes */}
          {allSizes.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={2}>
                Kích Cỡ:
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {allSizes.map((s) => {
                  const key = `${selectedColor}_${s}`;
                  const stock = stockMap[key];
                  const isInvalid =
                    !selectedColor || stock === undefined || stock <= 0;
                  return (
                    <Tooltip key={s} label={isInvalid ? 'Hết hàng' : s}>
                      <Box
                        borderWidth="1px"
                        borderColor={
                          selectedSize === s ? brandColor : borderColor
                        }
                        px={3}
                        py={1}
                        borderRadius="md"
                        fontSize="sm"
                        cursor={isInvalid ? 'not-allowed' : 'pointer'}
                        bg={selectedSize === s ? brandColor : 'transparent'}
                        color={
                          isInvalid
                            ? 'gray.400'
                            : selectedSize === s
                            ? 'white'
                            : textColor
                        }
                        opacity={isInvalid ? 0.5 : 1}
                        onClick={() => {
                          if (!isInvalid) setSelectedSize(s);
                        }}
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
          <HStack spacing={4} mt={4}>
            <HStack
              spacing={0}
              borderWidth="1px"
              borderRadius="full"
              overflow="hidden"
            >
              <Button
                variant="ghost"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </Button>
              <Box w="50px" textAlign="center">
                {quantity}
              </Box>
              <Button
                variant="ghost"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              >
                +
              </Button>
            </HStack>

            <Button colorScheme="brand" color="white" onClick={handleAddToCart}>
              Thêm Vào Giỏ Hàng
            </Button>
          </HStack>

          {/* 🛡️ Commitments */}
          <Box mt={8} w="100%">
            <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>
              Cam Kết Từ Trendify
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Flex
                align="center"
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                p={4}
                gap={3}
              >
                <Icon as={MdLocalShipping} boxSize={6} color={brandColor} />
                <Text fontSize="sm" color={descColor}>
                  Giao hàng trong <b>3–5 ngày</b> <br /> Miễn phí vận chuyển trên{' '}
                  <b>499.000 ₫</b>
                </Text>
              </Flex>

              <Flex
                align="center"
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                p={4}
                gap={3}
              >
                <Icon as={MdReplay} boxSize={6} color={brandColor} />
                <Text fontSize="sm" color={descColor}>
                  Hoàn trả <b>15 ngày</b> dễ dàng
                </Text>
              </Flex>

              <Flex
                align="center"
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                p={4}
                gap={3}
              >
                <Icon as={MdLock} boxSize={6} color={brandColor} />
                <Text fontSize="sm" color={descColor}>
                  Thanh toán an toàn & bảo mật dữ liệu
                </Text>
              </Flex>

              {/* 🔔 Chat now → mở ChatWidget */}
              <Flex
                align="center"
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                p={4}
                gap={3}
                cursor="pointer"
                onClick={handleChatNow}
              >
                <Icon as={MdChat} boxSize={6} color={brandColor} />
                <Text fontSize="sm" fontWeight="semibold" color={descColor}>
                  Cần hỗ trợ? <b>Chat ngay</b>
                </Text>
              </Flex>
            </SimpleGrid>
          </Box>
        </VStack>
      </Flex>
    </Box>
  );
}
