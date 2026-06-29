import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  HStack,
  Box,
  Text,
  Flex,
  Image,
  Tag,
  TagLabel,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { PRODUCT_PLACEHOLDER, resolveImageUrl } from 'utils/ImageHelper';

export default function CartVariantModal({
  isOpen,
  onClose,
  item,
  onSave,
  productVariants = [],
}) {
  const bgColor = useColorModeValue('fashion.softSurface', 'navy.800');
  const borderColor = useColorModeValue('fashion.stone', 'gray.600');
  const brandColor = useColorModeValue('brand.500', 'brand.300');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  const [selectedColor, setSelectedColor] = useState(item.color);
  const [selectedSize, setSelectedSize] = useState(item.size);


  const productImages = useMemo(() => item.images || [], [item.images]);


  const displayImage = useMemo(() => {
    if (selectedColor) {
      const match = productImages.find(
        (img) => img.color?.toLowerCase() === selectedColor.toLowerCase(),
      );
      if (match) return match.url;
    }

    const thumb =
      productImages.find((img) => img.isThumbnail) || productImages[0];
    return thumb?.url || item.imageUrl || item.thumbnailUrl;
  }, [selectedColor, productImages, item.imageUrl, item.thumbnailUrl]);


  const availableColors = useMemo(
    () => [...new Set(productVariants.map((v) => v.color).filter(Boolean))],
    [productVariants],
  );

  const availableSizes = useMemo(() => {
    const sizes = [
      ...new Set(productVariants.map((v) => v.size).filter(Boolean)),
    ];

    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    const normalize = (val) => val?.trim().toUpperCase();
    const isRange = (s) => /^\d+\s*-\s*\d+$/.test(s);
    const isNumber = (s) => /^\d+$/.test(s);

    return sizes.sort((a, b) => {
      const A = normalize(a);
      const B = normalize(b);

      const idxA = sizeOrder.indexOf(A);
      const idxB = sizeOrder.indexOf(B);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;

      if (isRange(A) && isRange(B)) {
        const numA = parseInt(A.split('-')[0]);
        const numB = parseInt(B.split('-')[0]);
        return numA - numB;
      }

      if (isNumber(A) && isNumber(B)) {
        return parseInt(A) - parseInt(B);
      }

      return A.localeCompare(B);
    });
  }, [productVariants]);


  const sizeStatus = useMemo(() => {
    const map = {};
    availableSizes.forEach((s) => {
      const variant = productVariants.find(
        (v) => v.color === selectedColor && v.size === s,
      );
      if (!variant) {
        map[s] = { stock: 0, exists: false };
      } else {
        map[s] = { stock: variant.stock, exists: true };
      }
    });
    return map;
  }, [selectedColor, availableSizes, productVariants]);

  const currentVariantLabel =
    selectedColor || selectedSize
      ? `${
          selectedColor?.charAt(0).toUpperCase() + selectedColor?.slice(1) || ''
        }${selectedColor && selectedSize ? ' / ' : ''}${selectedSize || ''}`
      : 'Default';

  const handleSave = () => {
    const match = productVariants.find(
      (v) => v.color === selectedColor && v.size === selectedSize,
    );

    if (!match) return alert('Biến thể này không tồn tại.');
    if (match.stock <= 0) return alert('Biến thể này đã hết hàng.');

    onSave({ ...item, color: selectedColor, size: selectedSize });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="2xl" overflow="hidden" bg={bgColor}>
        <ModalHeader borderBottomWidth="1px" fontWeight="bold">
          Chỉnh Sửa Biến Thể
        </ModalHeader>

        <ModalBody py={5}>
          {}
          <Flex gap={4} align="center" mb={5}>
            <Image
              src={resolveImageUrl(displayImage)}
              alt={item.name}
              boxSize="90px"
              borderRadius="md"
              objectFit="cover"
              bg="fashion.pageBg"
              fallbackSrc={PRODUCT_PLACEHOLDER}
            />
            <Box flex="1">
              <Text fontWeight="semibold" color={textColor} noOfLines={1}>
                {item.productName || item.name}
              </Text>
              <Tag
                size="sm"
                variant="subtle"
                borderRadius="full"
                mt={2}
                bg={useColorModeValue('fashion.pageBg', 'gray.700')}
              >
                <TagLabel>{currentVariantLabel}</TagLabel>
              </Tag>
            </Box>
          </Flex>

          {}
          {availableColors.length > 0 && (
            <Box mb={5}>
              <Text fontWeight="semibold" mb={2} color={textColor}>
                Màu Sắc:
              </Text>
              <HStack spacing={3} wrap="wrap">
                {availableColors.map((c) => {
                  const hasStock = productVariants.some(
                    (v) => v.color === c && v.stock > 0,
                  );
                  const colorImage = productImages.find(
                    (img) => img.color?.toLowerCase() === c.toLowerCase(),
                  );

                  return (
                    <Tooltip
                      key={c}
                      label={!hasStock ? 'Hết hàng' : undefined}
                      hasArrow
                    >
                      <Box
                        w="36px"
                        h="36px"
                        borderRadius="md"
                        borderWidth="2px"
                        borderColor={
                          selectedColor === c ? brandColor : borderColor
                        }
                        bgImage={colorImage ? `url(${resolveImageUrl(colorImage.url)})` : 'none'}
                        bgSize="cover"
                        bgPos="center"
                        bgColor={!colorImage ? c.toLowerCase() : undefined}
                        cursor={hasStock ? 'pointer' : 'not-allowed'}
                        opacity={hasStock ? 1 : 0.4}
                        pointerEvents={hasStock ? 'auto' : 'none'}
                        onClick={() => {
                          setSelectedColor(c);
                          setSelectedSize(null);
                        }}
                        transition="all 0.2s"
                        _hover={{ transform: 'scale(1.05)' }}
                      />
                    </Tooltip>
                  );
                })}
              </HStack>
            </Box>
          )}

          {}
          {availableSizes.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={2} color={textColor}>
                Kích Cỡ:
              </Text>
              <HStack spacing={2} wrap="wrap">
                {availableSizes.map((s) => {
                  const info = sizeStatus[s];
                  const outOfStock = !info?.exists || info?.stock <= 0;
                  return (
                    <Tooltip
                      key={s}
                      label={
                        outOfStock ? 'Hết hàng' : `Còn ${info?.stock} sản phẩm`
                      }
                      hasArrow
                    >
                      <Box
                        px={3}
                        py={1}
                        borderWidth="1px"
                        borderRadius="md"
                        cursor={outOfStock ? 'not-allowed' : 'pointer'}
                        color={outOfStock ? subTextColor : textColor}
                        borderColor={
                          selectedSize === s && !outOfStock
                            ? brandColor
                            : borderColor
                        }
                        opacity={outOfStock ? 0.5 : 1}
                        pointerEvents={outOfStock ? 'none' : 'auto'}
                        onClick={() => !outOfStock && setSelectedSize(s)}
                        transition="all 0.2s"
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        {s}
                      </Box>
                    </Tooltip>
                  );
                })}
              </HStack>
            </Box>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px">
          <Button variant="ghost" mr={3} onClick={onClose}>
            Hủy
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSave}
            isDisabled={!selectedColor || !selectedSize}
          >
            Lưu
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
