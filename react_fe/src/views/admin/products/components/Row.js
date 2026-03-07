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
import { formatUSD } from 'utils/FormatHelper';
import { useUser } from 'contexts/UserContext';

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
  const { user } = useUser();
  const role = user?.roleName; // ADMIN | EMPLOYEE | USER
  const isEmployee = role === 'EMPLOYEE';

  const isExpanded = expandedRows[product.id];
  const toast = useAppToast();
  const [active, setActive] = useState(product.isActive);
  const switchColor = useColorModeValue('brand.400', 'brand.300');

  const handleActiveToggle = async (e) => {
    const newStatus = e.target.checked;
    setActive(newStatus);
    try {
      await ProductService.updateActive(product.id, newStatus);
      toast.success(`Product ${newStatus ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update active status');
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
      {/* === Product Row === */}
      <Tr _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}>
        {/* Thumbnail */}
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

        {/* Name */}
        <Td
          onClick={() => toggleExpand(product.id)}
          _hover={{ cursor: 'pointer' }}
        >
          <Text fontWeight="600">{product.name}</Text>
        </Td>

        {/* Price */}
        <Td>{formatUSD(product.price)}</Td>

        {/* Category */}
        <Td>
          <Text fontSize="sm" color="gray.600">
            {product.categoryName || '—'}
          </Text>
        </Td>

        {/* ACTIVE COLUMN - hidden if EMPLOYEE */}
        {isEmployee ? (
          <Td></Td>
        ) : (
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
        )}

        {/* ACTION BUTTONS */}
        <Td textAlign="right">
          <Flex justify="flex-end" gap={2}>
            {/* Add Variant — EMPLOYEE + ADMIN */}
            <IconButton
              borderRadius="xl"
              aria-label="Add Variant"
              size="sm"
              icon={<MdAdd />}
              colorScheme="green"
              onClick={() => onAddVariant(product)}
            />

            {/* Edit — EMPLOYEE + ADMIN */}
            <IconButton
              borderRadius="xl"
              aria-label="Edit"
              size="sm"
              icon={<MdEdit />}
              colorScheme="blue"
              onClick={() => onEdit(product)}
            />

            {!isEmployee && (
              <IconButton
                borderRadius="xl"
                aria-label="Delete"
                size="sm"
                icon={<MdDelete />}
                colorScheme="red"
                onClick={() => onDelete(product)}
              />
            )}
          </Flex>
        </Td>
      </Tr>

      {/* === Variant Rows === */}
      {isExpanded &&
        (product.variants && product.variants.length > 0 ? (
          product.variants.map((v) => (
            <Tr key={v.id}>
              {/* IMAGE BY COLOR */}
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
                      No image
                    </Text>
                  );
                })()}
              </Td>

              {/* Color */}
              <Td>
                <Text fontWeight="500" textTransform="capitalize">
                  Color: {v.color}
                </Text>
              </Td>

              {/* Size */}
              <Td>
                <Text fontSize="sm">Size: {v.size || '—'}</Text>
              </Td>

              {/* Category empty column */}
              <Td></Td>

              {/* Stock */}
              <Td>
                <Text fontSize="sm" color="gray.600">
                  {v.stock ?? 0} in stock
                </Text>
              </Td>

              {/* Actions */}
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

                  {!isEmployee && (
                    <IconButton
                      borderRadius="xl"
                      aria-label="Delete Variant"
                      size="sm"
                      icon={<MdDelete />}
                      colorScheme="red"
                      onClick={() => onDeleteVariant(v)}
                    />
                  )}
                </Flex>
              </Td>
            </Tr>
          ))
        ) : (
          <Tr>
            <Td pl={(depth + 1) * 6} colSpan={6}>
              <Text color="gray.500" fontSize="sm">
                No variants
              </Text>
            </Td>
          </Tr>
        ))}
    </>
  );
}
