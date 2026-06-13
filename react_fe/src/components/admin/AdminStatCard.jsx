import React from 'react';
import { Flex, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

export default function AdminStatCard({ label, value, icon, featured = false }) {
  return (
    <Flex
      bg={featured ? 'fashion.charcoal' : 'white'}
      color={featured ? 'white' : 'fashion.textMain'}
      border="1px solid"
      borderColor={featured ? 'fashion.charcoal' : 'fashion.borderLight'}
      borderRadius="16px"
      p={5}
      align="center"
      gap={4}
    >
      {icon}
      <Stat>
        <StatLabel color={featured ? 'whiteAlpha.700' : 'fashion.textMuted'}>{label}</StatLabel>
        <StatNumber fontSize="xl">{value}</StatNumber>
      </Stat>
    </Flex>
  );
}
