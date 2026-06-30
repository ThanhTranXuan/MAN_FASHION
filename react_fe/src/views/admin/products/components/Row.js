import React, { useState } from 'react';
import {
  Tr,
  Td,
  Flex,
  Text,
  IconButton,
  Image,
  Switch,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useAppToast } from 'utils/ToastHelper';
import ProductService from 'services/ProductService';
import { formatCurrencyVND } from 'utils/FormatHelper';
import { getColorLabel } from 'utils/ColorNameHelper';

export default function Row({
  product,
  depth = 0,
  expandedRows,
  toggleExpand,
  onAddVariant,
  onEdit,
  onDelete,
  onOpenImages,
  onEditVariant,
  onDeleteVariant,
}) {
  const isExpanded = expandedRows[product.id];
  const toast = useAppToast();
  const [active, setActive] = useState(product.isActive);
  const switchColor = useColorModeValue('brand.400', 'brand.300');

  const handleActiveToggle = async (e) => {
    const newStatus = e.target.checked;
    setActive(newStatus);
    try {
      await ProductService.updateActive(product.id, newStatus);
      toast.success(`Sản phẩm đã được ${newStatus ? 'bật' : 'tắt'}`);
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái');
      setActive(product.isActive);
    }
  };

  const getThumbnailUrl = () => {
    if (!product.images || product.images.length === 0) return null;
    const thumb = product.images.find((img) => img.isThumbnail);
    return thumb ? thumb.url : product.images[0].url;
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <>
      {}
      <Tr _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}>
        {}
        <Td pl={depth * 4}>
          {thumbnailUrl && (
            <Image
              src={thumbnailUrl}
              boxSize="80px"
              borderRadius="md"
              ms={5}
              _hover={{ cursor: 'pointer', opacity: 0.9 }}
              onClick={() => onOpenImages(product)}
            />
          )}
        </Td>

        {}
        <Td
          onClick={() => toggleExpand(product.id)}
          _hover={{ cursor: 'pointer' }}
        >
          <Text fontWeight="600">{product.name}</Text>
        </Td>

        {}
        <Td>{formatCurrencyVND(product.price)}</Td>

        {}
        <Td>
          <Text fontSize="sm" color="gray.600">
            {product.categoryName || '—'}
          </Text>
        </Td>

        {}
        <Td>
          <Switch
            colorScheme="green"
            isChecked={active}
            onChange={handleActiveToggle}
            size="lg"
            sx={{
              'span.chakra-switch__track': {
                bg: active ? switchColor : 'gray.400',
              },
            }}
          />
        </Td>

        {}
        <Td textAlign="right">
          <Flex justify="flex-end" gap={2}>
            {}
            <IconButton
              borderRadius="xl"
              aria-label="Add Variant"
              size="sm"
              icon={<MdAdd />}
              colorScheme="green"
              onClick={() => onAddVariant(product)}
            />

            {}
            <IconButton
              borderRadius="xl"
              aria-label="Edit"
              size="sm"
              icon={<MdEdit />}
              colorScheme="blue"
              onClick={() => onEdit(product)}
            />

            <IconButton
              borderRadius="xl"
              aria-label="Delete"
              size="sm"
              icon={<MdDelete />}
              colorScheme="red"
              onClick={() => onDelete(product)}
            />
          </Flex>
        </Td>
      </Tr>

      {}
      {isExpanded &&
        (product.variants && product.variants.length > 0 ? (
          product.variants.map((v) => (
            <Tr key={v.id}>
              {}
              <Td>
                {(() => {
                  const colorImg =
                    product.images?.find((img) => img.color === v.color) ||
                    product.images?.find((img) => img.color === null) ||
                    null;

                  return colorImg ? (
                    <Image
                      src={colorImg.url}
                      boxSize="60px"
                      borderRadius="md"
                      objectFit="cover"
                      _hover={{ cursor: 'pointer', opacity: 0.9 }}
                      onClick={() =>
                        onOpenImages({
                          ...product,
                          variantColor: v.color,
                        })
                      }
                    />
                  ) : (
                    <Text fontSize="xs" color="gray.400">
                      Không có ảnh
                    </Text>
                  );
                })()}
              </Td>

              {}
              <Td>
                <Text fontWeight="500" textTransform="capitalize">
                  Màu sắc: {getColorLabel(v.color)}
                </Text>
              </Td>

              {}
              <Td>
                <Text fontSize="sm">Kích cỡ: {v.size || '—'}</Text>
              </Td>

              {}
              <Td></Td>

              {}
              <Td>
                <Text fontSize="sm" color="gray.600">
                  Tồn: {v.stock ?? 0} | Giá: {formatCurrencyVND(v.price)}
                </Text>
              </Td>

              {}
              <Td textAlign="right">
                <Flex justify="flex-end" gap={2}>
                  <IconButton
                    borderRadius="xl"
                    aria-label="Edit Variant"
                    size="sm"
                    icon={<MdEdit />}
                    colorScheme="blue"
                    onClick={() => onEditVariant(v, product)}
                  />

                  <IconButton
                    borderRadius="xl"
                    aria-label="Delete Variant"
                    size="sm"
                    icon={<MdDelete />}
                    colorScheme="red"
                    onClick={() => onDeleteVariant(v)}
                  />
                </Flex>
              </Td>
            </Tr>
          ))
        ) : (
          <Tr>
            <Td pl={(depth + 1) * 6} colSpan={6}>
              <Text color="gray.500" fontSize="sm">
                Không có biến thể.
              </Text>
            </Td>
          </Tr>
        ))}
    </>
  );
}
