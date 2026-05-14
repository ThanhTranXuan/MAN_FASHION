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

import BlogService from 'services/BlogService';
import sanitizeHtml from 'sanitize-html';
import Editor from './Editor';
import ImageUploader from 'components/img/ImageUploader';

export default function Form({ isOpen, onClose, reloadBlogs, blog }) {
  const toast = useAppToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const headerBg = useColorModeValue('gray.100', 'navy.800');

  useEffect(() => {
    if (isOpen) {
      if (blog) {
        setTitle(blog.title || '');
        setContent(blog.content || '');
        setThumbnail(blog.thumbnail || '');

        setThumbnailPreview(blog.thumbnail ? [blog.thumbnail] : []);
      } else {
        setTitle('');
        setContent('');
        setThumbnail('');
        setThumbnailPreview([]);
      }
    }
  }, [blog, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const sanitizedContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          'img',
          'iframe',
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height'],
          iframe: ['src', 'frameborder', 'allow', 'allowfullscreen'],
        },
      });

      const data = { title, content: sanitizedContent, thumbnail: '' };
      const file = Array.isArray(thumbnail) ? thumbnail[0] : null;

      if (blog) {
        await BlogService.update(blog.id, data, file);
        toast.success('Cập nhật bài viết thành công');
      } else {
        await BlogService.create(data, file);
        toast.success('Tạo bài viết thành công');
        setTitle('');
        setContent('');
        setThumbnail('');
        setThumbnailPreview('');
      }

      reloadBlogs?.();
      onClose();
    } catch (err) {
      console.error('❌ Blog save error:', err);
      toast.error('Lỗi khi lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="3xl">
      <ModalOverlay />
      <ModalContent borderRadius="20px" bg={bgColor} color={textColor}>
        <ModalHeader bg={headerBg} borderTopRadius="20px">
          {blog ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="flex-start">
            <FormControl>
              <FormLabel>Ảnh bìa</FormLabel>
              <ImageUploader
                multiple={false}
                value={thumbnailPreview}
                onChange={(files, previews) => {
                  setThumbnail(files);
                  setThumbnailPreview(previews);
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Tiêu đề</FormLabel>
              <Input
                color={textColor}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết"
                name="blog-title"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Nội dung</FormLabel>
              <Editor value={content} onChange={setContent} />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter bg={headerBg} borderBottomRadius="20px" mt={10}>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Hủy
          </Button>
          <Button colorScheme={blog ? 'blue' : 'green'} isLoading={loading} onClick={handleSubmit}>
            {blog ? 'Cập nhật' : 'Tạo'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
