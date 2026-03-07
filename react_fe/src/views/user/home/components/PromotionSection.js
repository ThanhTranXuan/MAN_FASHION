import { Box, Button, Text, useColorModeValue } from '@chakra-ui/react';
import { MotionFlex, MotionText, MotionImage } from './MotionPrimitives';

export default function PromotionSection({
  image,
  title,
  desc,
  buttonText,
  buttonIcon,
  colorScheme,
  bgColor,
  reverse,
}) {
  return (
    <MotionFlex
      bg={bgColor}
      direction={{ base: 'column', md: reverse ? 'row-reverse' : 'row' }}
      align="center"
      justify="space-between"
      gap={{ base: 10, md: 20 }}
      px={{ base: 6, md: 20 }}
      py={10}
      borderRadius="2xl"
    >
      <Box width="400px" textAlign="center">
        <MotionImage
          src={image}
          alt={title}
          borderRadius="2xl"
          objectFit="contain"
          w="100%"
          h="300px"
        />
      </Box>

      <Box flex={1} maxW="500px">
        <MotionText
          fontSize={{ base: '2xl', md: '4xl' }}
          fontWeight="bold"
          bgGradient="linear(to-r, #7366ff, #d633ff, #ff6a00)"
          bgClip="text"
          mb={4}
        >
          {title}
        </MotionText>
        <Text fontSize="lg" color={useColorModeValue('gray.700', 'whiteAlpha.800')} mb={6}>
          {desc}
        </Text>
        <Button
          leftIcon={buttonIcon}
          size="lg"
          colorScheme={colorScheme}
          rounded="full"
          color={colorScheme === 'brand' ? 'white' : undefined}
        >
          {buttonText}
        </Button>
      </Box>
    </MotionFlex>
  );
}
