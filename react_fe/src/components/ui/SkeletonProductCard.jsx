import React from 'react';
import { Skeleton, Stack } from '@chakra-ui/react';

export default function SkeletonProductCard() {
  return <Stack spacing={3}><Skeleton aspectRatio={3 / 4} borderRadius="16px" /><Skeleton h="16px" /><Skeleton h="18px" w="55%" /></Stack>;
}
