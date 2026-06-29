import React from 'react';
import {
  Tr,
  Td,
  Box,
  Flex,
  Image,
  Text,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md';
import { useUser } from 'contexts/UserContext';

export default function Row({
  cat,
  depth = 0,
  expandedRows,
  toggleExpand,
  onAdd,
  onEdit,
  onDelete,
  renderChildren,
}) {
  const { user } = useUser();
  const role = user?.roleName;
  const isEmployee = role === 'EMPLOYEE';

  const isExpanded = expandedRows[cat.id];

  return (
    <>
      <Tr _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}>
        <Td _hover={{ cursor: 'pointer' }} onClick={() => toggleExpand(cat.id)}>
          <Flex align="center" pl={depth * 3}>
            <Text fontSize="sm" fontWeight="600">
              {cat.name}
            </Text>
            {cat.children?.length > 0 && (
              <IconButton
                aria-label="expand"
                size="sm"
                variant="ghost"
                icon={isExpanded ? <MdExpandLess /> : <MdExpandMore />}
              />
            )}
          </Flex>
        </Td>

        <Td>
          {cat.thumbnailUrl ? (
            <Image
              src={cat.thumbnailUrl}
              alt={cat.name}
              boxSize="48px"
              objectFit="cover"
              borderRadius="md"
            />
          ) : (
            <Box boxSize="48px" borderRadius="md" bg="gray.100" />
          )}
        </Td>

        <Td textAlign="right">
          <Flex justify="flex-end" gap={2}>
            {}
            <IconButton
              aria-label="Add Subcategory"
              size="sm"
              icon={<MdAdd />}
              colorScheme="green"
              borderRadius="xl"
              onClick={() => onAdd(cat)}
            />

            {}
            <IconButton
              aria-label="Edit"
              size="sm"
              icon={<MdEdit />}
              colorScheme="blue"
              borderRadius="xl"
              onClick={() => onEdit(cat)}
            />

            {}
            {!isEmployee && (
              <IconButton
                aria-label="Delete"
                size="sm"
                icon={<MdDelete />}
                colorScheme="red"
                borderRadius="xl"
                onClick={() => onDelete(cat)}
              />
            )}
          </Flex>
        </Td>
      </Tr>

      {isExpanded && cat.children?.map((child) => renderChildren(child, depth + 1))}
    </>
  );
}
