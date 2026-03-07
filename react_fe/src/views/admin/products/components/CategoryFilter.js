import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Text,
  Box,
  Button,
} from '@chakra-ui/react';
import { MdArrowDropDown } from 'react-icons/md';

export default function CategoryFilter({
  categories = [],
  categoryFilter,
  setCategoryFilter,
  bgColor,
  borderColor,
  brandColor,
}) {
  // 🧠 Build tree structure
  const buildTree = (list) => {
    const map = {};
    const roots = [];

    list.forEach((item) => (map[item.id] = { ...item, children: [] }));

    list.forEach((item) => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  };

  const categoryTree = buildTree(categories);

  // 🧭 Recursive render (now using slug)
  const renderTree = (nodes, level = 1) =>
    nodes.map((node) => {
      const isLeaf = !node.children || node.children.length === 0;

      return (
        <Box key={node.id} bg={bgColor}>
          <MenuItem
            bg={bgColor}
            ps={level * 2}
            py={1.5}
            onClick={() => {
              if (isLeaf) setCategoryFilter(node.slug); // ✅ dùng slug thay vì id
            }}
          >
            <Flex w="100%" justify="space-between" align="center">
              <Text
                fontWeight={categoryFilter === node.slug ? 'bold' : 'normal'}
              >
                {node.name}
              </Text>
              <Box
                h="36px"
                w="4px"
                bg={categoryFilter === node.slug ? brandColor : 'transparent'}
                borderRadius="5px"
              />
            </Flex>
          </MenuItem>

          {node.children &&
            node.children.length > 0 &&
            renderTree(node.children, level + 1)}
        </Box>
      );
    });

  return (
    <Menu isLazy matchWidth>
      <MenuButton
        as={Button}
        size="sm"
        variant="ghost"
        rightIcon={<MdArrowDropDown />}
        _hover={{ bg: 'transparent' }}
        _active={{ bg: 'transparent' }}
      >
        CATEGORY
      </MenuButton>
      <MenuList
        bg={bgColor}
        borderColor={borderColor}
        maxH="300px"
        overflowY="auto"
      >
        {/* All Option */}
        <MenuItem
          bg={bgColor}
          _hover={{ bg: 'transparent', color: brandColor }}
          onClick={() => setCategoryFilter(null)}
        >
          <Flex w="100%" justify="space-between" align="center">
            <Text fontWeight={!categoryFilter ? 'bold' : 'normal'}>All</Text>
            <Box
              h="36px"
              w="4px"
              bg={!categoryFilter ? brandColor : 'transparent'}
              borderRadius="5px"
            />
          </Flex>
        </MenuItem>

        {/* Tree Categories */}
        {categories.length > 0 ? (
          renderTree(categoryTree)
        ) : (
          <Box px={3} py={2} bg={bgColor}>
            <Text fontSize="sm" color="gray.500">
              No categories available
            </Text>
          </Box>
        )}
      </MenuList>
    </Menu>
  );
}
