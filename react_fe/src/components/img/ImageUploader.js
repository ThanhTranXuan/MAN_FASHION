import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Image,
  Text,
  SimpleGrid,
  IconButton,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';

export default function ImageUploader({
  multiple = false,
  value = [],
  onChange,
  onDelete,
}) {
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const textColor = useColorModeValue('gray.500', 'gray.400');
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // ✅ sync preview từ DB hoặc props (url / blob)
  useEffect(() => {
    if (Array.isArray(value)) setPreviews(value);
    else if (value) setPreviews([value]);
    else setPreviews([]);
    // files không cần sync từ value, chỉ dùng để biết file mới user chọn
  }, [value]);

  const handleFiles = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);
    const previewArray = fileArray.map((file) => URL.createObjectURL(file));

    const newFiles = multiple ? [...files, ...fileArray] : [fileArray[0]];
    const newPreviews = multiple
      ? [...previews, ...previewArray]
      : [previewArray[0]];

    setFiles(newFiles);
    setPreviews(newPreviews);
    onChange?.(newFiles, newPreviews);
  };

  const handleDelete = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setFiles(newFiles);
    setPreviews(newPreviews);
    onChange?.(newFiles, newPreviews);
    if (onDelete) onDelete(index);
  };

  const handleClick = () => fileInputRef.current?.click();

  return (
    <Box>
      <Box
        border="2px dashed"
        borderColor={previews.length > 0 ? 'transparent' : borderColor}
        borderRadius="md"
        cursor="pointer"
        textAlign="center"
        p={4}
        color={textColor}
        onClick={handleClick}
        transition="all 0.2s"
        _hover={{ borderColor: 'blue.400' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* 🔹 SINGLE: luôn hiển thị nếu có preview, KHÔNG check files.length */}
        {!multiple && previews.length > 0 && (
          <Flex justify="center" mt={3}>
            <Box position="relative" display="inline-block">
              <Image
                src={previews[0]}
                width="100%"
                maxW="360px"
                // nếu project bạn support browser cũ, có thể bỏ aspectRatio
                aspectRatio={16 / 9}
                objectFit="cover"
                borderRadius="md"
                border="2px solid"
                borderColor="blue.400"
                alt="preview"
              />
              <IconButton
                aria-label="delete"
                icon={<MdClose />}
                size="sm"
                colorScheme="red"
                variant="solid"
                position="absolute"
                top={-3}
                right={-3}
                borderRadius="full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(0);
                }}
              />
            </Box>
          </Flex>
        )}

        {/* 🔹 MULTI: grid preview */}
        {multiple && previews.length > 0 && (
          <SimpleGrid columns={[2, 3, 4]} spacing={3} mt={2}>
            {previews.map((src, idx) => (
              <Box key={idx} position="relative">
                <Image
                  src={src}
                  boxSize="90px"
                  objectFit="cover"
                  borderRadius="md"
                  alt={`preview-${idx}`}
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
                    handleDelete(idx);
                  }}
                />
              </Box>
            ))}
          </SimpleGrid>
        )}

        {/* 🔹 Không có ảnh nào */}
        {previews.length === 0 && (
          <Text fontWeight="semibold">
            {multiple
              ? 'Click or drop multiple images'
              : 'Click or drop image to upload'}
          </Text>
        )}
      </Box>
    </Box>
  );
}
