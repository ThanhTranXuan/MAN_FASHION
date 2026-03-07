import {
  Box,
  Text,
  InputGroup,
  Input,
  InputRightElement,
  Button,
} from '@chakra-ui/react';
import { MotionText } from './MotionPrimitives';

export default function SubscribeSection({ bgColor, textColor }) {
  return (
    <Box
      textAlign="center"
      px={{ base: 6, md: 20 }}
      py={10}
      bg={bgColor}
      borderRadius="2xl"
    >
      <MotionText
        fontSize={{ base: '2xl', md: '4xl' }}
        fontWeight="bold"
        mb={4}
        bgGradient="linear(to-r, #7366ff, #d633ff, #ff6a00)"
        bgClip="text"
      >
        Join the Trendify Community
      </MotionText>
      <Text fontSize="lg" color={textColor} mb={6}>
        Subscribe to get the latest deals, trends, and fashion news delivered to
        your inbox.
      </Text>
      <Box maxW="500px" mx="auto">
        <InputGroup size="lg" borderColor={textColor}>
          <Input
            placeholder="Enter your email"
            bg="whiteAlpha.200"
            borderRadius="full"
            pr="120px"
            color={textColor}
          />
          <InputRightElement width="100px">
            <Button
              h="full"
              size="md"
              color="white"
              colorScheme="brand"
              rounded="full"
            >
              Subscribe
            </Button>
          </InputRightElement>
        </InputGroup>
      </Box>
    </Box>
  );
}
