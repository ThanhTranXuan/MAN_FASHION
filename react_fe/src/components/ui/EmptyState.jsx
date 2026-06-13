import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import FashionButton from './FashionButton';

export default function EmptyState({ icon, title, description, action, actionText, actionTo, onAction }) {
  return (
    <Flex direction="column" align="center" justify="center" py={16} px={4} textAlign="center">
      {icon}
      <Heading size="md" mt={icon ? 4 : 0}>{title}</Heading>
      {description && <Text mt={2} color="secondaryGray.600" maxW="440px">{description}</Text>}
      {action}
      {!action && actionText && (
        <FashionButton mt={6} as={actionTo ? RouterLink : undefined} to={actionTo} onClick={onAction}>
          {actionText}
        </FashionButton>
      )}
    </Flex>
  );
}
