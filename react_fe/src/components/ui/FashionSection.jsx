import React from 'react';
import { Box } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import FashionContainer from './FashionContainer';
import FashionButton from './FashionButton';
import SectionHeader from './SectionHeader';

export default function FashionSection({ eyebrow, title, description, children, actionText, actionTo, variant = 'default', ...props }) {
  return (
    <Box bg={variant === 'soft' ? 'fashion.softSurface' : 'transparent'} py={{ base: 10, md: 16 }} {...props}>
      <FashionContainer>
        {(title || eyebrow) && (
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            mb={8}
            action={actionText && <FashionButton as={RouterLink} to={actionTo} variant="outline" size="sm">{actionText}</FashionButton>}
          />
        )}
        {children}
      </FashionContainer>
    </Box>
  );
}
