import { Box, Text } from '@chakra-ui/react';
import { MotionText } from './MotionPrimitives';

export default function AboutSection({ textColor }) {
  return (
    <Box px={{ base: 6, md: 20 }} py={10} textAlign="center" color="white">
      <MotionText
        fontSize={{ base: '2xl', md: '4xl' }}
        fontWeight="bold"
        mb={4}
        bgGradient="linear(to-r, #7366ff, #d633ff, #ff6a00)"
        bgClip="text"
      >
        Why Trendify?
      </MotionText>
      <Text fontSize="lg" color={textColor} maxW="700px" mx="auto">
        Trendify brings you the ultimate online shopping experience – from
        clothing and accessories to a lifestyle blog. We help you define your
        own unique style.
      </Text>
    </Box>
  );
}
