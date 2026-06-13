import React from 'react';
import { Button } from '@chakra-ui/react';

const variants = {
  primary: { bg: '#050505', color: 'white', _hover: { bg: 'fashion.charcoal' } },
  dark: { bg: '#050505', color: 'white', _hover: { bg: 'fashion.charcoal' } },
  secondary: { bg: 'white', color: 'fashion.textMain', border: '1px solid', borderColor: 'fashion.borderLight' },
  outline: { bg: 'transparent', color: 'fashion.textMain', border: '1px solid', borderColor: 'fashion.textMain' },
  ghost: { bg: 'transparent', color: 'fashion.textMain' },
  sale: { bg: 'sale.500', color: 'white', _hover: { bg: 'sale.600' } },
  light: { bg: 'fashion.softSurface', color: 'fashion.textMain' },
};

export default function FashionButton({ variant = 'primary', ...props }) {
  return <Button borderRadius="12px" {...variants[variant]} {...props} />;
}
