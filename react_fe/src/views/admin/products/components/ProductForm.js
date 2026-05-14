import React, { useEffect, useState, useRef } from 'react';
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
import { MdClose } from 'react-icons/md';

import { useAppToast } from 'utils/ToastHelper';
import { urlToFile } from 'utils/UrlToFile';

import ProductService from 'services/ProductService';
import { useCategories } from 'contexts/CategoryContext';
import { ChevronDownIcon } from '@chakra-ui/icons';

export default function ProductForm({ isOpen, onClose, reload, editingItem }) {
  const toast = useAppToast();
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');

  const [files, setFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const headerBg = useColorModeValue('gray.100', 'navy.800');

  // ---------------------------
  // Build category tree
  // ---------------------------
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

  // ---------------------------
  // Load form when edit
  // ---------------------------
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description || '');
      setPrice(editingItem.price?.toString());
      setCategoryId(editingItem.categoryId?.toString());
      setCategoryName(editingItem.categoryName);

      const imgs =
        editingItem.images?.map((img) => img.url)?.filter(Boolean) || [];
      setImagePreviews(imgs);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setCategoryName('');
      setImagePreviews([]);
    }
    setFiles([]);
  }, [editingItem]);

  // ---------------------------
  // Chọn file ảnh mới
  // ---------------------------
  const handleFileSelect = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const arr = Array.from(e.target.files);
    const previews = arr.map((file) => URL.createObjectURL(file));
    setFiles((prev) => [...prev, ...arr]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  // ---------------------------
  // Xóa ảnh preview (không gọi biến undefined)
  // ---------------------------
  const handleDeletePreview = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---------------------------
  // Submit product
  // ---------------------------
  const handleSubmit = async () => {
    if (!name || !price || !categoryId) {
      toast.error('Vui lòng điền đủ các trường bắt buộc');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        categoryId: categoryId.toString(), // ✅ bảo đảm là string
        isActive: true,
      };

      const res = editingItem
        ? await ProductService.update(editingItem.id, payload)
        : await ProductService.create(payload);

      // ✅ Xử lý success cho 201/200
      const status = res.status;
      if (status === 201 || status === 200) {
        const productId = res.data?.id || editingItem?.id;

        const needUpload =
          files.length > 0 ||
          imagePreviews.some(
            (p) =>
              !(typeof p === 'string' && p.startsWith('blob:')) &&
              !p.startsWith('blob:'),
          );

        // nếu cần upload ảnh
        if (needUpload && productId) {
          const mergedFiles = [];

          for (let i = 0; i < imagePreviews.length; i++) {
            const preview = imagePreviews[i];

            // ✅ Chỉ convert ảnh cũ là URL http real, không convert blob preview mới
            if (typeof preview === 'string' && preview.startsWith('http')) {
              const oldFile = await urlToFile(preview, `old_${i}.png`);
              if (oldFile) mergedFiles.push(oldFile);
            }
          }

          mergedFiles.push(...files);

          if (mergedFiles.length > 0) {
            await ProductService.uploadImages(productId, {
              color: null,
              files: mergedFiles,
            });
          }
        }

        toast.success(editingItem ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!');
        reload();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setLoading(false); // ✅ chỉ 1 lần
    }
  };

  // ---------------------------
  // Render category tree UI
  // ---------------------------
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
      <ModalContent borderRadius="20px" bg={bgColor} color={textColor}>
        <ModalHeader bg={headerBg}>
          {editingItem ? 'Chỉnh Sửa Sản Phẩm' : 'Tạo Sản Phẩm'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Upload ảnh */}
          <FormControl mb={3} isRequired>
            <FormLabel>Ảnh Sản Phẩm</FormLabel>
            <Box
              border="2px dashed"
              borderColor={
                files.length === 0 && imagePreviews.length > 0
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

              {imagePreviews.length > 0 && (
                <SimpleGrid columns={[2, 3, 4]} spacing={3} mt={2}>
                  {imagePreviews.map((src, idx) => (
                    <Box key={idx} position="relative">
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
                          handleDeletePreview(idx);
                        }}
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              )}

              {imagePreviews.length === 0 && (
                <Text fontWeight="semibold" color="gray.400">
                  Nhấp để tải ảnh lên
                </Text>
              )}
            </Box>
          </FormControl>

          {/* Tên */}
          <FormControl mb={3} isRequired>
            <FormLabel>Tên Sản Phẩm</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              color={textColor}
            />
          </FormControl>

          {/* Mô tả */}
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

          <Flex gap={4} mb={3}>
            {/* Giá */}
            <FormControl isRequired>
              <FormLabel>Giá</FormLabel>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                color={textColor}
              />
            </FormControl>

            {/* Danh mục */}
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
