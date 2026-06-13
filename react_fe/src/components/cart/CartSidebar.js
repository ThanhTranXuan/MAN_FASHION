// src/components/cart/CartSidebar.jsx
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerFooter,
  Text,
  Flex,
  Icon,
  Spinner,
  Button,
  Box,
  Image,
  HStack,
  IconButton,
  Tag,
  TagLabel,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { IoMdCart, IoMdTrash } from 'react-icons/io';
import { MdExpandMore } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from 'contexts/CartContext';
import { useAppToast } from 'utils/ToastHelper';
import { formatCurrencyVND } from 'utils/FormatHelper';
import { PRODUCT_PLACEHOLDER, resolveImageUrl } from 'utils/ImageHelper';
import ProductService from 'services/ProductService';
import CartVariantModal from './CartVariantModal';

export default function CartSidebar({ isOpen, onClose }) {
  const {
    cart,
    loading,
    updateQuantity,
    updateVariant,
    removeItem,
  } = useCart();
  const navigate = useNavigate();
  const toast = useAppToast();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');

  const {
    isOpen: isVariantOpen,
    onOpen,
    onClose: onVariantClose,
  } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState(null);
  const [productVariants, setProductVariants] = useState([]);

  const handleGoToPayment = () => {
    onClose();
    navigate('/user/payment'); // nếu route thực tế là /user/order thì đổi lại
  };

  const handleOpenVariant = async (item) => {
    try {
      const { data } = await ProductService.getDetailById(item.productId);
      if (!data) return toast.error('Không tìm thấy sản phẩm');

      setSelectedItem({
        ...item,
        images: data.images || [],
        variants: data.variants || [],
      });
      setProductVariants(data.variants || []);
      onOpen();
    } catch {
      toast.error('Tải dữ liệu sản phẩm thất bại');
    }
  };

  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty < 1 || newQty > 99) return;
    await updateQuantity(item.id, item.color, item.size, newQty, toast);
  };

  const handleSaveVariant = async (updated) => {
    const newVariant = productVariants.find(
      (v) =>
        (!updated.color || v.color === updated.color) &&
        (!updated.size || v.size === updated.size),
    );
    if (!newVariant) return toast.error('Không tìm thấy biến thể phù hợp');

    await updateVariant(updated, newVariant, toast);
    onVariantClose();
  };

  const handleRemoveItem = async (item) => {
    await removeItem(item.id, item.color, item.size, toast);
  };

  return (
    <>
      <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="sm">
        <DrawerOverlay />
        <DrawerContent bg={bgColor} color={textColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" fontSize="xl" fontWeight="800">Giỏ hàng</DrawerHeader>

          <DrawerBody overflowY="auto" flex="1" py={4}>
            {loading ? (
              <Flex justify="center" align="center" h="100%">
                <Spinner />
              </Flex>
            ) : !cart?.items?.length ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                h="100%"
                gap={3}
                color="gray.500"
              >
                <Icon as={IoMdCart} w={12} h={12} />
                <Text fontWeight="700">Giỏ hàng của bạn đang trống</Text>
                <Text fontSize="sm" textAlign="center">
                  Khám phá sản phẩm mới và chọn món đồ yêu thích.
                </Text>
              </Flex>
            ) : (
              <Flex direction="column" gap={4}>
                {cart.items.map((item) => (
                  <Box
                    key={item.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="12px"
                  >
                    <Flex gap={3} align="flex-start">
                      <Image
                        src={resolveImageUrl(item.imageUrl, item.thumbnailUrl, item.productImage)}
                        alt={item.productName || 'Product'}
                        w="96px"
                        h="120px"
                        minW="96px"
                        borderRadius="12px"
                        objectFit="cover"
                        bg="#f8fafc"
                        fallbackSrc={PRODUCT_PLACEHOLDER}
                      />
                      <Box flex="1">
                        <Flex
                          justify="space-between"
                          align="center"
                          mb={1}
                        >
                          <Text fontWeight="semibold" noOfLines={1}>
                            {item.productName}
                          </Text>
                          <IconButton
                            icon={<IoMdTrash />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleRemoveItem(item)}
                          />
                        </Flex>

                        {(item.color || item.size) && (
                          <Tag
                            size="sm"
                            variant="subtle"
                            borderRadius="full"
                            gap={2}
                            mb={2}
                            cursor="pointer"
                            onClick={() => handleOpenVariant(item)}
                          >
                            <TagLabel textTransform="capitalize">
                              {[item.color, item.size]
                                .filter(Boolean)
                                .join(' / ')}
                            </TagLabel>
                            <MdExpandMore />
                          </Tag>
                        )}

                        <Flex align="center" justify="space-between">
                          <HStack
                            spacing={0}
                            borderWidth="1px"
                            borderRadius="full"
                            overflow="hidden"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item,
                                  item.quantity - 1,
                                )
                              }
                            >
                              -
                            </Button>
                            <Box w="50px" textAlign="center">
                              {item.quantity}
                            </Box>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item,
                                  item.quantity + 1,
                                )
                              }
                            >
                              +
                            </Button>
                          </HStack>

                          <Text fontWeight="semibold" color="brand.500">
                            {formatCurrencyVND(item.price * item.quantity)}
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </Flex>
            )}
          </DrawerBody>

          {!loading && cart?.items?.length > 0 && (
            <DrawerFooter
              borderTopWidth="1px"
              flexDirection="column"
              alignItems="stretch"
              gap={3}
            >
              <Flex justify="space-between" w="100%">
                <Text fontWeight="bold">Tổng:</Text>
                <Text fontWeight="bold" color="brand.500">
                  {formatCurrencyVND(cart.totalPrice)}
                </Text>
              </Flex>
              <Button
                bg="navy.900"
                color="white"
                size="lg"
                w="full"
                onClick={handleGoToPayment}
                _hover={{ bg: 'navy.700' }}
              >
                Đi Đến Thanh Toán
              </Button>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

      {selectedItem && (
        <CartVariantModal
          isOpen={isVariantOpen}
          onClose={onVariantClose}
          item={selectedItem}
          onSave={handleSaveVariant}
          productVariants={productVariants}
        />
      )}
    </>
  );
}
