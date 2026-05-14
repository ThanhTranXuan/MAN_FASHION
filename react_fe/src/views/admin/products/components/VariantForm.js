// src/components/product/VariantForm.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Flex,
  IconButton,
  Text,
  Menu,
  MenuButton,
  MenuList,
  Box,
  MenuItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import ProductService from 'services/ProductService';
import ImageUploader from 'components/img/ImageUploader';
import { MdDelete, MdAdd } from 'react-icons/md';

export default function VariantForm({
  isOpen,
  onClose,
  reload,
  parentProduct,
  editingVariant,
}) {
  const toast = useAppToast();
  const [color, setColor] = useState('');
  const [rows, setRows] = useState([{ size: '', stock: '' }]);
  const [variantFile, setVariantFile] = useState(null);
  const [variantPreview, setVariantPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const headerBg = useColorModeValue('gray.100', 'navy.800');

  const columnCount = useMemo(() => {
    if (rows.length >= 6) return 3;
    if (rows.length >= 3) return 2;
    return 1;
  }, [rows.length]);

  const modalSize = useMemo(() => {
    if (columnCount === 3) return '5xl';
    if (columnCount === 2) return '3xl';
    return 'lg';
  }, [columnCount]);

  // ✅ Load variant info + ảnh cũ từ DB
  useEffect(() => {
    if (!parentProduct) return;

    if (editingVariant) {
      setColor(editingVariant.color || '');
      setRows([
        { size: editingVariant.size || '', stock: editingVariant.stock || 0 },
      ]);

      const matchedImages =
        parentProduct.images?.filter(
          (img) =>
            img.color &&
            img.color.toLowerCase() ===
              (editingVariant.color || '').toLowerCase(),
        ) || [];

      setVariantPreview(matchedImages.length > 0 ? matchedImages[0].url : '');
    } else {
      setColor('');
      setRows([{ size: '', stock: '' }]);
      setVariantPreview('');
    }

    setVariantFile(null);
  }, [editingVariant, parentProduct]);

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => setRows((prev) => [...prev, { size: '', stock: '' }]);

  const removeRow = (index) => {
    if (rows.length === 1) return toast.error('At least one size is required');
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!parentProduct) return toast.error('Missing parent product');
    if (!color) return toast.error('Please select a color');

    for (const r of rows) {
      if (!r.size || !r.stock) {
        return toast.error('Please fill all size and stock fields');
      }
    }

    setLoading(true);
    try {
      // 🔎 Kiểm tra xem ban đầu có ảnh DB cho màu này không
      const hadOldImage =
        parentProduct.images?.some(
          (img) => img.color && img.color.toLowerCase() === color.toLowerCase(),
        ) || false;

      // 1️⃣ Tạo / cập nhật variant (JSON)
      for (const row of rows) {
        const variantData = {
          color,
          size: row.size,
          stock: parseInt(row.stock, 10),
        };

        if (editingVariant) {
          await ProductService.updateVariant(editingVariant.id, variantData);
        } else {
          await ProductService.createVariant(parentProduct.id, variantData);
        }
      }

      // 2️⃣ Ảnh: dùng duy nhất 1 ảnh / color
      const hasNewImage = !!variantFile;
      const imageRemoved = !variantPreview && hadOldImage;

      if (hasNewImage) {
        // 👉 Replace ảnh cũ bằng ảnh mới
        await ProductService.uploadImages(parentProduct.id, {
          color,
          files: [variantFile],
        });
      } else if (imageRemoved) {
        // 👉 User xoá hết ảnh → gửi uploadImages không kèm file để xoá
        await ProductService.uploadImages(parentProduct.id, {
          color,
          files: [],
        });
      }
      // 👉 Nếu không đổi ảnh thì KHÔNG gọi uploadImages → giữ nguyên ảnh DB

      toast.success(editingVariant ? 'Cập nhật biến thể thành công!' : 'Thêm biến thể thành công!');
      reload();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lưu biến thể thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePreview = () => {
    setVariantPreview('');
    setVariantFile(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="20px" bg={bgColor} color={textColor}>
        <ModalHeader bg={headerBg}>
          {editingVariant ? 'Chỉnh Sửa Biến Thể' : 'Thêm Biến Thể'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody
          maxH="65vh"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(100, 100, 100, 0.4)',
              borderRadius: '4px',
            },
          }}
        >
          <FormControl mb={5}>
            <FormLabel>Ảnh Biến Thể</FormLabel>
            <ImageUploader
              multiple={false}
              value={variantPreview ? [variantPreview] : []}
              onChange={(files, previews) => {
                setVariantFile(files[0] || null);
                setVariantPreview(previews[0] || '');
              }}
              onDelete={handleRemovePreview}
            />
          </FormControl>

          {/* Color picker */}
          <FormControl mb={5} isRequired>
            <FormLabel>Màu Sắc</FormLabel>
            <Menu placement="bottom-end">
              <MenuButton
                w="100%"
                as={Button}
                justifyContent="flex-start"
                borderWidth="1px"
                borderColor="gray.300"
                variant="outline"
              >
                {color ? (
                  <Flex align="center" gap={2}>
                    <Box
                      w="18px"
                      h="18px"
                      borderRadius="full"
                      bg={color.toLowerCase()}
                      borderWidth="1px"
                      borderColor="gray.300"
                    />
                    <Text>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </Text>
                  </Flex>
                ) : (
                  'Chọn màu'
                )}
              </MenuButton>

              <MenuList maxH="250px" overflowY="auto">
                {[
                  'White',
                  'Beige',
                  'Yellow',
                  'Orange',
                  'Red',
                  'Pink',
                  'Purple',
                  'Teal',
                  'Cyan',
                  'Green',
                  'Blue',
                  'Navy',
                  'Brown',
                  'Gray',
                  'Black',
                ].map((c) => (
                  <MenuItem
                    key={c}
                    onClick={() => setColor(c.toLowerCase())}
                    _hover={{ bg: 'gray.500' }}
                  >
                    <Flex align="center" gap={3}>
                      <Box
                        w="18px"
                        h="18px"
                        borderRadius="full"
                        bg={c === 'Navy' ? 'blue.900' : c.toLowerCase()}
                        borderWidth="1px"
                        borderColor="gray.400"
                      />
                      <Text>{c}</Text>
                    </Flex>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </FormControl>

          {/* Size & Stock dynamic rows */}
          <Flex wrap="wrap" gap={4}>
            {rows.map((r, i) => (
              <Flex
                key={i}
                flex={`1 1 calc(${100 / columnCount}% - 10px)`}
                align="flex-end"
                gap={3}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={3}
              >
                <FormControl isRequired>
                  <FormLabel>Kích Thước</FormLabel>
                  <Input
                    color={textColor}
                    value={r.size}
                    onChange={(e) => updateRow(i, 'size', e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Tồn Kho</FormLabel>
                  <Input
                    color={textColor}
                    type="number"
                    value={r.stock}
                    onChange={(e) => updateRow(i, 'stock', e.target.value)}
                  />
                </FormControl>
                <IconButton
                  icon={<MdDelete />}
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeRow(i)}
                  aria-label="Remove row"
                />
              </Flex>
            ))}
          </Flex>

          <Button
            hidden={!!editingVariant}
            mt={4}
            leftIcon={<MdAdd />}
            colorScheme="brand"
            variant="outline"
            onClick={addRow}
          >
            Thêm Kích Thước
          </Button>
        </ModalBody>

        <ModalFooter bg={headerBg}>
          <Button
            colorScheme={editingVariant ? 'blue' : 'green'}
            isLoading={loading}
            onClick={handleSubmit}
          >
            {editingVariant ? 'Cập Nhật' : 'Thêm'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
