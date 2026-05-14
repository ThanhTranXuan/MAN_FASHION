import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import CategoryService from 'services/CategoryService';

export default function Form({
  isOpen,
  onClose,
  reloadCategories,
  category,
  parentCategory,
}) {
  const toast = useAppToast();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const headerBg = useColorModeValue('gray.100', 'navy.800');

  // ✅ Sync category prop khi mở modal
  useEffect(() => {
    if (category) {
      setName(category.name || '');
    } else {
      setName('');
    }
  }, [category, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔹 Nếu là cập nhật
      if (category) {
        const payload = { name };

        await CategoryService.update(category.id, payload);
        toast.success('Đã cập nhật danh mục thành công');
      } else {
        // 🔹 Nếu là tạo mới
        const payload = {
          name,
          parentId: parentCategory ? parentCategory.id : null,
          parentSlug: parentCategory ? parentCategory.slug : null,
        };

        await CategoryService.create(payload);
        toast.success(
          parentCategory
            ? 'Đã tạo danh mục con thành công'
            : 'Đã tạo danh mục thành công',
        );
      }

      if (reloadCategories) reloadCategories();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="20px" bg={bgColor} color={textColor}>
        <ModalHeader bg={headerBg} borderTopRadius="20px">
          {category
            ? 'Chỉnh Sửa Danh Mục'
            : parentCategory
            ? `Thêm Danh Mục Con vào "${parentCategory.name}"`
            : 'Tạo Danh Mục Mới'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="flex-start">
            <FormControl isRequired>
              <FormLabel>Tên Danh Mục</FormLabel>
              <Input
                color={textColor}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên danh mục"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter bg={headerBg} borderBottomRadius="20px">
          <Button variant="ghost" mr={3} onClick={onClose}>
            Hủy
          </Button>
          <Button
            colorScheme={category ? 'blue' : 'green'}
            type="submit"
            isLoading={loading}
            onClick={handleSubmit}
          >
            {category ? 'Cập Nhật' : 'Tạo Mới'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
