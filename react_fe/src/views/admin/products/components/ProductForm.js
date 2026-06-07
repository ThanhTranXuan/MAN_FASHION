import React, { useEffect, useRef, useState } from 'react';
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
  Textarea,
  Box,
  Text,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  SimpleGrid,
  IconButton,
  Image,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { MdClose } from 'react-icons/md';

import ProductService from 'services/ProductService';
import { useCategories } from 'contexts/CategoryContext';
import { useAppToast } from 'utils/ToastHelper';

export default function ProductForm({ isOpen, onClose, reload, editingItem }) {
  const toast = useAppToast();
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const headerBg = useColorModeValue('gray.100', 'navy.800');

  const buildTree = (flat) => {
    const map = {};
    flat.forEach((c) => (map[c.id] = { ...c, children: [] }));
    const roots = [];
    flat.forEach((c) => {
      if (c.parentId) map[c.parentId]?.children.push(map[c.id]);
      else roots.push(map[c.id]);
    });
    return roots;
  };

  const categoryTree = buildTree(categories);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description || '');
      setPrice(editingItem.price?.toString());
      setCategoryId(editingItem.categoryId?.toString());
      setCategoryName(editingItem.categoryName);
      setExistingImages(editingItem.images?.filter((img) => img.url) || []);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setCategoryName('');
      setExistingImages([]);
    }

    setNewImages([]);
    setNewImagePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setDeletedImageIds([]);
  }, [editingItem]);

  const handleFileSelect = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));

    setNewImages((prev) => [...prev, ...selectedFiles]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = '';
  };

  const handleRemoveExistingImage = (image) => {
    if (!image?.url) return;

    setExistingImages((prev) =>
      prev.filter((item) =>
        image.id ? item.id !== image.id : item.url !== image.url,
      ),
    );
    if (image.id != null) {
      const imageId = Number(image.id);
      setDeletedImageIds((prev) =>
        prev.includes(imageId) ? prev : [...prev, imageId],
      );
    }
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!name || !price || !categoryId) {
      toast.error('Vui lòng điền đủ các trường bắt buộc');
      return;
    }

    if (existingImages.length + newImages.length === 0) {
      toast.error('Vui lòng giữ lại hoặc thêm ít nhất 1 ảnh sản phẩm.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        categoryId: categoryId.toString(),
        isActive: true,
      };

      if (editingItem && deletedImageIds.length > 0) {
        payload.deletedImageIds = deletedImageIds;
      }

      const res = editingItem
        ? await ProductService.update(editingItem.id, payload)
        : await ProductService.create(payload);

      const status = res.status;
      if (status === 201 || status === 200) {
        const productId = res.data?.data?.id || res.data?.id || editingItem?.id;

        if (newImages.length > 0 && productId) {
          const remainingProductImageUrls = existingImages
            .filter((img) => !img.color)
            .map((img) => img.url)
            .filter(Boolean);

          await ProductService.uploadImages(productId, {
            color: null,
            files: newImages,
            remainingImageUrls: editingItem
              ? remainingProductImageUrls
              : undefined,
          });
        }

        toast.success(editingItem ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!');
        reload();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const renderTreeUI = (nodes, level = 1) =>
    nodes.map((node) => (
      <Box key={node.id} bg={bgColor}>
        <MenuItem
          pl={level * 4}
          bg={bgColor}
          _hover={{ color: brandColor }}
          onClick={() => {
            setCategoryId(node.id);
            setCategoryName(node.name);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
        >
          <Text>{node.name}</Text>
        </MenuItem>
        {node.children?.length > 0 && renderTreeUI(node.children, level + 1)}
      </Box>
    ));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="16px"
        bg={bgColor}
        color={textColor}
        mx={{ base: 3, md: 0 }}
        maxH={{ base: 'calc(100vh - 24px)', md: 'calc(100vh - 48px)' }}
      >
        <ModalHeader bg={headerBg}>
          {editingItem ? 'Chỉnh Sửa Sản Phẩm' : 'Tạo Sản Phẩm'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3} isRequired>
            <FormLabel>Ảnh Sản Phẩm</FormLabel>
            <Box
              border="2px dashed"
              borderColor={
                newImages.length === 0 &&
                existingImages.length + newImagePreviews.length > 0
                  ? 'transparent'
                  : 'gray.500'
              }
              borderRadius="md"
              cursor="pointer"
              p={4}
              textAlign="center"
              onClick={() => fileInputRef.current?.click()}
              _hover={{ borderColor: 'blue.400' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFileSelect}
              />

              {existingImages.length + newImagePreviews.length > 0 && (
                <SimpleGrid columns={[2, 3, 4]} spacing={3} mt={2}>
                  {existingImages.map((img) => (
                    <Box key={img.id || img.url} position="relative">
                      <Image
                        src={img.url}
                        boxSize="90px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <IconButton
                        aria-label="delete"
                        icon={<MdClose />}
                        size="xs"
                        colorScheme="red"
                        position="absolute"
                        top={-2}
                        right={-1}
                        borderRadius="full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveExistingImage(img);
                        }}
                      />
                    </Box>
                  ))}

                  {newImagePreviews.map((src, idx) => (
                    <Box key={src} position="relative">
                      <Image
                        src={src}
                        boxSize="90px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <IconButton
                        aria-label="delete"
                        icon={<MdClose />}
                        size="xs"
                        colorScheme="red"
                        position="absolute"
                        top={-2}
                        right={-1}
                        borderRadius="full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNewImage(idx);
                        }}
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              )}

              {existingImages.length + newImagePreviews.length === 0 && (
                <Text fontWeight="semibold" color="gray.400">
                  Nhấp để tải ảnh lên
                </Text>
              )}
            </Box>
          </FormControl>

          <FormControl mb={3} isRequired>
            <FormLabel>Tên Sản Phẩm</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              color={textColor}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Mô Tả</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              resize="none"
              color={textColor}
            />
          </FormControl>

          <Flex gap={4} mb={3} direction={{ base: 'column', sm: 'row' }}>
            <FormControl isRequired>
              <FormLabel>Giá</FormLabel>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                color={textColor}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Danh Mục</FormLabel>
              <Menu isLazy matchWidth>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  w="full"
                  variant="outline"
                >
                  {categoryName || 'Chọn danh mục'}
                </MenuButton>
                <MenuList maxH="250px" overflowY="auto" bg={bgColor}>
                  {categoryTree.length > 0 ? (
                    renderTreeUI(categoryTree)
                  ) : (
                    <Text p={3}>Không có danh mục</Text>
                  )}
                </MenuList>
              </Menu>
            </FormControl>
          </Flex>
        </ModalBody>

        <ModalFooter bg={headerBg}>
          <Button
            onClick={handleSubmit}
            isLoading={loading}
            bg={brandColor}
            color="white"
          >
            {editingItem ? 'Cập Nhật' : 'Tạo Mới'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
