import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const line = 'PHOM MỚI / ĐƯỜNG NÉT GỌN / SẴN SÀNG XUỐNG PHỐ / CHẤT LIỆU MÙA HÈ / ';

export default function MarqueeStatement() {
  return (
    <Box
      overflow="hidden"
      bg="#F97316"
      color="#0B0B0B"
      borderY="1px solid"
      borderColor="#0B0B0B"
      py={{ base: 3, md: 5 }}
    >
      <Text
        as="div"
        whiteSpace="nowrap"
        fontSize={{ base: '3xl', md: '6xl' }}
        fontWeight="950"
        lineHeight="1"
        letterSpacing="-0.05em"
        sx={{
          animation: 'trendify-marquee 18s linear infinite',
          '@keyframes trendify-marquee': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(-50%)' },
          },
        }}
      >
        {line.repeat(8)}
      </Text>
    </Box>
  );
}
