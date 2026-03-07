import { Box, SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';
import { FaShoppingCart, FaShippingFast, FaLock, FaBlog } from 'react-icons/fa';
import { MotionFlex } from './MotionPrimitives';

export default function FeaturesSection({ brandColor }) {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const descColor = useColorModeValue('gray.600', 'whiteAlpha.700');

  const features = [
    {
      title: 'Easy Shopping',
      desc: 'Add to cart & checkout in just a few steps.',
      icon: FaShoppingCart,
    },
    {
      title: 'Free Shipping',
      desc: 'Enjoy free delivery on all orders over $50.',
      icon: FaShippingFast,
    },
    {
      title: 'Secure Payment',
      desc: 'Safe checkout with multiple payment options.',
      icon: FaLock,
    },
    {
      title: 'Fashion Blog',
      desc: 'Discover the latest trends & styling tips.',
      icon: FaBlog,
    },
  ];

  return (
    <SimpleGrid
      columns={{ base: 1, md: 4 }}
      spacing={10}
      px={{ base: 6, md: 20 }}
      py={10}
    >
      {features.map((f, i) => (
        <MotionFlex
          key={i}
          direction="column"
          align="center"
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          textAlign="center"
          shadow="sm"
          whileHover={{ scale: 1.1 }}
          transition="all 0.25s ease"
          cursor="pointer"
        >
          <Box fontSize="3xl" mb={5} color={brandColor}>
            <f.icon />
          </Box>
          <Text
            fontWeight="bold"
            fontSize="xl"
            mb={2}
            bgGradient="linear(to-r, #7366ff, #d633ff, #ff6a00)"
            bgClip="text"
          >
            {f.title}
          </Text>
          <Text color={descColor} fontSize="sm">
            {f.desc}
          </Text>
        </MotionFlex>
      ))}
    </SimpleGrid>
  );
}
