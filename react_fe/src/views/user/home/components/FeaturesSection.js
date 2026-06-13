import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import { FaBlog, FaLock, FaShippingFast, FaShoppingCart } from 'react-icons/fa';
import AppContainer from 'components/ui/AppContainer';
import { MotionFlex } from './MotionPrimitives';

const features = [
  {
    title: 'Mua sắm dễ dàng',
    desc: 'Tìm size, thêm vào giỏ và thanh toán chỉ trong vài bước.',
    icon: FaShoppingCart,
  },
  {
    title: 'Miễn phí vận chuyển',
    desc: 'Áp dụng cho đơn hàng từ 500.000 đ trên toàn quốc.',
    icon: FaShippingFast,
  },
  {
    title: 'Thanh toán an toàn',
    desc: 'Hỗ trợ nhiều phương thức thanh toán với quy trình rõ ràng.',
    icon: FaLock,
  },
  {
    title: 'Blog phối đồ',
    desc: 'Gợi ý xu hướng, cách phối và mẹo chăm sóc trang phục.',
    icon: FaBlog,
  },
];

export default function FeaturesSection() {
  return (
    <AppContainer py={{ base: 10, md: 16 }}>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
        {features.map((feature) => (
          <MotionFlex
            key={feature.title}
            direction="column"
            align="flex-start"
            p={{ base: 5, md: 6 }}
            minH="220px"
            borderRadius="22px"
            bg="#111827"
            color="white"
            border="1px solid rgba(255,255,255,0.08)"
            boxShadow="0 18px 44px rgba(15, 23, 42, 0.16)"
            whileHover={{ y: -5 }}
            transition="all 0.25s ease"
          >
            <Box
              w="52px"
              h="52px"
              display="grid"
              placeItems="center"
              borderRadius="16px"
              bg="#F97316"
              color="white"
              fontSize="22px"
              mb={6}
            >
              <feature.icon />
            </Box>
            <Text fontWeight="900" fontSize="xl" mb={2}>
              {feature.title}
            </Text>
            <Text color="whiteAlpha.700" fontSize="sm" lineHeight="1.7">
              {feature.desc}
            </Text>
          </MotionFlex>
        ))}
      </SimpleGrid>
    </AppContainer>
  );
}
