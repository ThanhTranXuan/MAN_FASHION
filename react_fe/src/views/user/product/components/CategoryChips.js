import React, { useMemo } from 'react';
import { HStack, Tag, TagLabel } from '@chakra-ui/react';

export default function CategoryChips({ categories, activeSlug, onSelect }) {
  // ==========================================
  // 🔍 Lấy category hiện tại
  // ==========================================
  const current = useMemo(
    () => categories.find((c) => c.slug === activeSlug),
    [categories, activeSlug]
  );

  // ==========================================
  // 🧩 Danh sách chip cần hiển thị
  // ==========================================
  const chips = useMemo(() => {
    if (!activeSlug) {
      // ➤ All Products → hiển thị category cấp 1
      return categories.filter((c) => !c.parentId);
    }

    // ➤ Nếu current có con → hiển thị cấp tiếp theo
    const children = categories.filter((c) => c.parentId === current?.id);
    if (children.length > 0) return children;

    // ➤ Nếu current là cấp 3 → hiển thị cùng cấp (level siblings)
    if (current?.parentId) {
      return categories.filter((c) => c.parentId === current.parentId);
    }

    return [];
  }, [categories, activeSlug, current]);

  // Không có chip → không render
  if (chips.length === 0) return null;

  // ==========================================
  // 🧩 RENDER COMPONENT
  // ==========================================
  return (
    <HStack
      spacing={2}
      mt={3}
      overflowX={{ base: 'auto', md: 'visible' }}
      py={{ base: 1, md: 0 }}
      sx={{
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
      wrap="nowrap"
    >
      {/* ==============================
          🏷️ "All" button khi đang trong category con
         ============================== */}
      {current && (
        <Tag
          key="all"
          size="lg"
          variant="outline"
          colorScheme="gray"
          cursor="pointer"
          borderRadius={20}
          px={4}
          flexShrink={0}
          whiteSpace="nowrap"
          onClick={() => onSelect(current.parentSlug || '')}
        >
          <TagLabel whiteSpace="nowrap">All</TagLabel>
        </Tag>
      )}

      {/* ==============================
          🏷️ Render category chips
         ============================== */}
      {chips.map((c) => (
        <Tag
          key={c.id}
          size="lg"
          variant={c.slug === activeSlug ? 'solid' : 'subtle'}
          colorScheme={c.slug === activeSlug ? 'brand' : 'gray'}
          cursor="pointer"
          borderRadius={20}
          px={4}
          flexShrink={0}
          whiteSpace="nowrap"
          transition="all 0.2s ease"
          onClick={() => onSelect(c.slug)}
        >
          <TagLabel whiteSpace="nowrap">{c.name}</TagLabel>
        </Tag>
      ))}
    </HStack>
  );
}
