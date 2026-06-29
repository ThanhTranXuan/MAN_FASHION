import React, { useMemo } from 'react';
import { HStack, Tag, TagLabel } from '@chakra-ui/react';

export default function CategoryChips({ categories, activeSlug, onSelect }) {



  const current = useMemo(
    () => categories.find((c) => c.slug === activeSlug),
    [categories, activeSlug]
  );




  const chips = useMemo(() => {
    if (!activeSlug) {

      return categories.filter((c) => !c.parentId);
    }


    const children = categories.filter((c) => c.parentId === current?.id);
    if (children.length > 0) return children;


    if (current?.parentId) {
      return categories.filter((c) => c.parentId === current.parentId);
    }

    return [];
  }, [categories, activeSlug, current]);


  if (chips.length === 0) return null;




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
      {

}
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
          <TagLabel whiteSpace="nowrap">Tất cả</TagLabel>
        </Tag>
      )}

      {

}
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
