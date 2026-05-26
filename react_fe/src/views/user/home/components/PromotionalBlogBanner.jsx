import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Image,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { MdArrowForward, MdLocalOffer } from 'react-icons/md';
import BlogService from 'services/BlogService';

const promotionKeywords = ['sale', 'khuyen mai', 'uu dai'];

export default function PromotionalBlogBanner() {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const overlay = useColorModeValue(
    'linear-gradient(110deg, rgba(17,24,39,0.88) 0%, rgba(49,46,129,0.72) 48%, rgba(234,88,12,0.62) 100%)',
    'linear-gradient(110deg, rgba(9,9,11,0.92) 0%, rgba(49,46,129,0.78) 50%, rgba(194,65,12,0.66) 100%)',
  );

  useEffect(() => {
    let isMounted = true;

    const fetchPromotionBlog = async () => {
      try {
        let selectedBlog = null;

        for (const keyword of promotionKeywords) {
          const res = await BlogService.getAll({ keyword, page: 0, size: 1 });
          selectedBlog = res.data.content?.[0];
          if (selectedBlog) break;
        }

        if (!selectedBlog) {
          const latestRes = await BlogService.getAll({ page: 0, size: 1 });
          selectedBlog = latestRes.data.content?.[0];
        }

        if (isMounted) {
          setBlog(selectedBlog || null);
        }
      } catch (err) {
        console.error('Lỗi load banner khuyến mãi:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPromotionBlog();

    return () => {
      isMounted = false;
    };
  }, []);

  const description = useMemo(() => {
    const text = (blog?.content || '').replace(/<[^>]*>/g, '').trim();
    return text || 'Khám phá chương trình ưu đãi mới nhất và các gợi ý phối đồ đáng chú ý trong tháng này.';
  }, [blog]);

  if (loading) {
    return (
      <Flex px={{ base: 4, md: 20 }} py={{ base: 6, md: 8 }} justify="center">
        <Spinner />
      </Flex>
    );
  }

  if (!blog?.slug) return null;

  return (
    <Box px={{ base: 4, md: 20 }} py={{ base: 6, md: 8 }}>
      <Box
        as={RouterLink}
        to={`/user/blog/detail/${blog.slug}`}
        display="block"
        position="relative"
        overflow="hidden"
        borderRadius={{ base: '18px', md: '24px' }}
        minH={{ base: '280px', md: '260px' }}
        boxShadow="lg"
        bg="gray.900"
        _hover={{
          textDecoration: 'none',
          transform: 'translateY(-3px)',
          boxShadow: '2xl',
        }}
        transition="all 0.25s ease"
      >
        {blog.thumbnail && (
          <Image
            src={blog.thumbnail}
            alt={blog.title}
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            opacity={0.42}
          />
        )}
        <Box position="absolute" inset={0} bg={overlay} />

        <Flex
          position="relative"
          zIndex={1}
          minH={{ base: '280px', md: '260px' }}
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={{ base: 7, md: 10 }}
          px={{ base: 5, md: 10, xl: 14 }}
          py={{ base: 7, md: 9 }}
          color="white"
        >
          <Box maxW={{ base: '100%', md: '640px' }}>
            <Badge
              display="inline-flex"
              alignItems="center"
              gap="6px"
              px={3}
              py={1}
              borderRadius="full"
              bg="whiteAlpha.300"
              color="white"
              letterSpacing="0"
              mb={4}
            >
              <MdLocalOffer />
              SALE
            </Badge>
            <Text
              fontSize={{ base: '2xl', md: '4xl' }}
              fontWeight="bold"
              lineHeight="1.15"
              mb={3}
            >
              Ưu Đãi Tháng Này
            </Text>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              lineHeight="1.7"
              maxW="620px"
              noOfLines={{ base: 3, md: 2 }}
              opacity={0.94}
            >
              {description}
            </Text>
          </Box>

          <Button
            as="span"
            rightIcon={<MdArrowForward />}
            bg="white"
            color="gray.900"
            borderRadius="full"
            px={7}
            h="48px"
            flexShrink={0}
            _hover={{ bg: 'orange.100' }}
          >
            Khám phá ưu đãi
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
