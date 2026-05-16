import React from 'react';
import { Box, Grid, GridItem, Text, Button, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export default function CollectionGridSection() {
  return (
    <Box py={10} px={{ base: 4, md: 20 }} maxW="1440px" mx="auto">
      <Text
        fontSize={{ base: '2xl', md: '3xl' }}
        fontWeight="bold"
        mb={8}
        textAlign="center"
        bgGradient="linear(to-r, #7366ff, #d633ff, #ff6a00)"
        bgClip="text"
      >
        Bộ Sưu Tập Nổi Bật
      </Text>
      
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
        templateRows={{ base: 'auto', md: 'repeat(2, 280px)' }}
        gap={6}
      >
        {/* Banner lớn bên trái */}
        <GridItem
          as={RouterLink}
          to="/user/product"
          colSpan={{ base: 1, md: 2 }}
          rowSpan={{ base: 1, md: 2 }}
          position="relative"
          borderRadius="2xl"
          overflow="hidden"
          transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          _hover={{ 
            transform: 'translateY(-5px)',
            shadow: '2xl',
            '& .bg-image': { transform: 'scale(1.1)' },
            '& .overlay': { bg: 'blackAlpha.500' }
          }}
        >
          <Box
            className="bg-image"
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            backgroundImage="url('https://images.unsplash.com/photo-1550614000-4b95d415d8f1?auto=format&fit=crop&w=1200&q=80')"
            backgroundSize="cover"
            backgroundPosition="center"
            transition="transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          />
          <Box
            className="overlay"
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            bg="blackAlpha.400"
            transition="background 0.4s ease"
          />
          <Flex
            position="relative"
            zIndex={1}
            direction="column"
            justify="flex-end"
            h="100%"
            p={8}
            color="white"
          >
            <Text fontSize="sm" fontWeight="bold" letterSpacing="widest" mb={2} opacity={0.9}>XU HƯỚNG MỚI</Text>
            <Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight="bold" mb={4}>Bộ sưu tập Mùa Hè</Text>
            <Button 
              size="md" 
              colorScheme="whiteAlpha" 
              variant="outline"
              w="max-content"
              borderRadius="full"
              px={8}
              _hover={{ bg: 'white', color: 'black' }}
            >
              Khám phá ngay
            </Button>
          </Flex>
        </GridItem>

        {/* Banner nhỏ phía trên bên phải */}
        <GridItem
          as={RouterLink}
          to="/user/product"
          position="relative"
          borderRadius="2xl"
          overflow="hidden"
          h={{ base: '200px', md: 'auto' }}
          transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          _hover={{ 
            transform: 'translateY(-5px)',
            shadow: 'xl',
            '& .bg-image': { transform: 'scale(1.1)' },
            '& .overlay': { bg: 'blackAlpha.400' }
          }}
        >
          <Box
            className="bg-image"
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            backgroundImage="url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80')"
            backgroundSize="cover"
            backgroundPosition="center"
            transition="transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          />
          <Box
            className="overlay"
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            bg="blackAlpha.300"
            transition="background 0.4s ease"
          />
          <Flex
            position="relative"
            zIndex={1}
            direction="column"
            justify="flex-end"
            h="100%"
            p={6}
            color="white"
          >
            <Text fontSize="xl" fontWeight="bold">Phụ Kiện Nổi Bật</Text>
          </Flex>
        </GridItem>

        {/* Banner nhỏ phía dưới bên phải */}
        <GridItem
          as={RouterLink}
          to="/user/product"
          position="relative"
          borderRadius="2xl"
          overflow="hidden"
          h={{ base: '200px', md: 'auto' }}
          transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          _hover={{ 
            transform: 'translateY(-5px)',
            shadow: 'xl',
            '& .bg-image': { transform: 'scale(1.1)' },
            '& .overlay': { bg: 'blackAlpha.400' }
          }}
        >
          <Box
            className="bg-image"
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            backgroundImage="url('https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80')"
            backgroundSize="cover"
            backgroundPosition="center"
            transition="transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          />
          <Box
            className="overlay"
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            bg="blackAlpha.300"
            transition="background 0.4s ease"
          />
          <Flex
            position="relative"
            zIndex={1}
            direction="column"
            justify="flex-end"
            h="100%"
            p={6}
            color="white"
          >
            <Text fontSize="xl" fontWeight="bold">Giày Sneakers</Text>
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
}
