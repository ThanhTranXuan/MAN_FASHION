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
import ImageUploader from 'components/img/ImageUploader';

export default function Form({
  isOpen,
  onClose,
  reloadCategories,
  category,
  parentCategory,
}) {
  const toast = useAppToast();

  const [name, setName] = useState('');
  const [thumbnailFiles, setThumbnailFiles] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const headerBg = useColorModeValue('gray.100', 'navy.800');


  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setThumbnailFiles([]);
      const thumbnail =
        category.thumbnailUrl || category.thumbnail_url || category.imageUrl || category.thumbnail;
      setThumbnailPreview(thumbnail ? [thumbnail] : []);
    } else {
      setName('');
      setThumbnailFiles([]);
      setThumbnailPreview([]);
    }
  }, [category, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      if (category) {
        const payload = {
          name,
          thumbnailUrl: thumbnailPreview[0] || '',
        };
        const file = thumbnailFiles[0] || null;

        await CategoryService.update(category.id, payload, file);
        toast.success('Đã cập nhật danh mục thành công');
      } else {

        const payload = {
          name,
          thumbnailUrl: thumbnailPreview[0] || '',
          parentId: parentCategory ? parentCategory.id : null,
          parentSlug: parentCategory ? parentCategory.slug : null,
        };
        const file = thumbnailFiles[0] || null;

        await CategoryService.create(payload, file);
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
      <ModalContent borderRadius="16px" bg={bgColor} color={textColor} maxH="calc(100vh - 32px)">
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
            <FormControl>
              <FormLabel>Ảnh thumbnail</FormLabel>
              <ImageUploader
                multiple={false}
                value={thumbnailPreview}
                onChange={(files, previews) => {
                  setThumbnailFiles(files);
                  setThumbnailPreview(previews);
                }}
              />
            </FormControl>

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
