import React from 'react';
import { Badge } from '@chakra-ui/react';

export default function FashionBadge({ variant = 'new', children, ...props }) {
  return <Badge variant={variant} textTransform="uppercase" letterSpacing="0.08em" {...props}>{children}</Badge>;
}
