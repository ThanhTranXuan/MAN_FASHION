import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdDelete, MdAdd } from 'react-icons/md';
import ImageUploader from 'components/img/ImageUploader';
import ProductService from 'services/ProductService';
import { COLOR_OPTIONS, getColorLabel, getColorSwatch } from 'utils/ColorNameHelper';
import { useAppToast } from 'utils/ToastHelper';

const ColorMenu = memo(function ColorMenu({ color, onChange, borderColor }) {
  const selectedLabel = getColorLabel(color);

  return (
    <Menu placement="bottom-end" isLazy lazyBehavior="unmount">
      <MenuButton
        w="100%"
        as={Button}
        justifyContent="flex-start"
        borderWidth="1px"
        borderColor={borderColor}
        variant="outline"
      >
        {color ? (
          <Flex align="center" gap={2}>
            <Box
              w="18px"
              h="18px"
              borderRadius="full"
              bg={getColorSwatch(color)}
              borderWidth="1px"
              borderColor="gray.300"
            />
            <Text>{selectedLabel}</Text>
          </Flex>
        ) : (
          'Chọn màu'
        )}
      </MenuButton>

      <MenuList maxH="240px" overflowY="auto" py={1}>
        {COLOR_OPTIONS.map((item) => (
          <MenuItem key={item.value} onClick={() => onChange(item.value)}>
            <Flex align="center" gap={3}>
              <Box
                w="18px"
                h="18px"
                borderRadius="full"
                bg={item.swatch}
                borderWidth="1px"
                borderColor="gray.400"
              />
              <Text>{item.label}</Text>
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
});

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
  const borderColor = useColorModeValue('gray.300', 'gray.600');

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

  useEffect(() => {
    if (!parentProduct) return;

    if (editingVariant) {
      const nextColor = editingVariant.color || '';
      setColor(nextColor);
      setRows([{ size: editingVariant.size || '', stock: editingVariant.stock ?? '' }]);

      const matchedImage = parentProduct.images?.find(
        (img) => img.color && img.color.toLowerCase() === nextColor.toLowerCase(),
      );
      setVariantPreview(matchedImage?.url || '');
    } else {
      setColor('');
      setRows([{ size: '', stock: '' }]);
      setVariantPreview('');
    }

    setVariantFile(null);
  }, [editingVariant, parentProduct]);

  const updateRow = useCallback((index, field, value) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }, []);

  const addRow = useCallback(
    () => setRows((prev) => [...prev, { size: '', stock: '' }]),
    [],
  );

  const removeRow = useCallback(
    (index) => {
      if (rows.length === 1) {
        toast.error('Vui lòng giữ ít nhất một kích cỡ');
        return;
      }
      setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
    },
    [rows.length, toast],
  );

  const handleSubmit = async () => {
    if (!parentProduct) return toast.error('Không tìm thấy sản phẩm cha');
    if (!color) return toast.error('Vui lòng chọn màu');

    for (const row of rows) {
      if (!row.size) return toast.error('Vui lòng chọn kích cỡ');
      if (row.stock === '' || row.stock === null || row.stock === undefined) {
        return toast.error('Vui lòng nhập số lượng tồn kho');
      }
    }

    setLoading(true);
    try {
      const hadOldImage =
        parentProduct.images?.some(
          (img) => img.color && img.color.toLowerCase() === color.toLowerCase(),
        ) || false;

      for (const row of rows) {
        const variantData = {
          color,
          size: row.size,
          stock: Number.parseInt(row.stock, 10),
        };

        if (editingVariant) {
          await ProductService.updateVariant(editingVariant.id, variantData);
        } else {
          await ProductService.createVariant(parentProduct.id, variantData);
        }
      }

      const hasNewImage = !!variantFile;
      const imageRemoved = !variantPreview && hadOldImage;

      if (hasNewImage) {
        await ProductService.uploadImages(parentProduct.id, {
          color,
          files: [variantFile],
        });
      } else if (imageRemoved) {
        await ProductService.uploadImages(parentProduct.id, {
          color,
          files: [],
        });
      }

      toast.success(editingVariant ? 'Cập nhật biến thể thành công' : 'Thêm biến thể thành công');
      await reload();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể lưu biến thể');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = useCallback((files, previews) => {
    setVariantFile(files[0] || null);
    setVariantPreview(previews[0] || '');
  }, []);

  const handleRemovePreview = useCallback(() => {
    setVariantPreview('');
    setVariantFile(null);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="16px" bg={bgColor} color={textColor} maxH="calc(100vh - 32px)">
        <ModalHeader bg={headerBg}>
          {editingVariant ? 'Chỉnh sửa biến thể' : 'Thêm biến thể'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="65vh" overflowY="auto">
          <FormControl mb={5}>
            <FormLabel>Ảnh biến thể</FormLabel>
            <ImageUploader
              multiple={false}
              value={variantPreview ? [variantPreview] : []}
              onChange={handleImageChange}
              onDelete={handleRemovePreview}
            />
          </FormControl>

          <FormControl mb={5} isRequired>
            <FormLabel>Màu sắc</FormLabel>
            <ColorMenu color={color} onChange={setColor} borderColor={borderColor} />
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: columnCount }} spacing={4}>
            {rows.map((row, index) => (
              <Flex
                key={index}
                align="flex-end"
                gap={3}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={3}
              >
                <FormControl isRequired>
                  <FormLabel>Kích cỡ</FormLabel>
                  <Input
                    color={textColor}
                    value={row.size}
                    onChange={(e) => updateRow(index, 'size', e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Tồn kho</FormLabel>
                  <Input
                    color={textColor}
                    type="number"
                    min={0}
                    value={row.stock}
                    onChange={(e) => updateRow(index, 'stock', e.target.value)}
                  />
                </FormControl>
                <IconButton
                  icon={<MdDelete />}
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeRow(index)}
                  aria-label="Xóa dòng kích cỡ"
                />
              </Flex>
            ))}
          </SimpleGrid>

          <Button
            hidden={!!editingVariant}
            mt={4}
            leftIcon={<MdAdd />}
            colorScheme="brand"
            variant="outline"
            onClick={addRow}
          >
            Thêm kích cỡ
          </Button>
        </ModalBody>

        <ModalFooter bg={headerBg}>
          <Button
            colorScheme={editingVariant ? 'blue' : 'green'}
            isLoading={loading}
            onClick={handleSubmit}
          >
            {editingVariant ? 'Cập nhật' : 'Thêm'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
