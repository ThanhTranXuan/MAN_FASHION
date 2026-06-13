import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, Flex, Image, Spinner, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { MdArrowForward, MdLocalOffer } from 'react-icons/md';
import BlogService from 'services/BlogService';
import AppContainer from 'components/ui/AppContainer';

const promotionKeywords = ['sale', 'khuyen mai', 'uu dai'];

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export default function PromotionalBlogBanner() {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const text = stripHtml(blog?.content);
    return (
      text ||
      'Khám phá ưu đãi mới nhất và những gợi ý phối đồ đáng chú ý trong tháng này.'
    );
  }, [blog]);

  if (loading) {
    return (
      <Flex px={{ base: 4, md: 20 }} py={{ base: 6, md: 8 }} justify="center">
        <Spinner color="brand.500" />
      </Flex>
    );
  }

  if (!blog?.slug) return null;

  return (
    <AppContainer py={{ base: 8, md: 12 }}>
      <Box
        as={RouterLink}
        to={`/user/blog/detail/${blog.slug}`}
        display="block"
        position="relative"
        overflow="hidden"
        borderRadius={{ base: '22px', md: '30px' }}
        minH={{ base: '360px', md: '340px' }}
        bg="#111827"
        color="white"
        boxShadow="0 24px 70px rgba(15, 23, 42, 0.22)"
        _hover={{
          textDecoration: 'none',
          transform: 'translateY(-4px)',
          '& img': { transform: 'scale(1.04)' },
        }}
        transition="transform 0.25s ease"
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
            opacity={0.52}
            transition="transform 0.45s ease"
          />
        )}
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(110deg, rgba(3,7,18,0.94) 0%, rgba(17,24,39,0.78) 48%, rgba(249,115,22,0.58) 100%)"
        />

        <Flex
          position="relative"
          zIndex={1}
          minH={{ base: '360px', md: '340px' }}
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={{ base: 7, md: 10 }}
          px={{ base: 6, md: 10, xl: 14 }}
          py={{ base: 8, md: 10 }}
        >
          <Box maxW={{ base: '100%', md: '720px' }}>
            <Badge
              display="inline-flex"
              alignItems="center"
              gap="6px"
              px={3}
              py={1}
              borderRadius="full"
              bg="#F97316"
              color="white"
              mb={5}
            >
              <MdLocalOffer />
              Ưu đãi nổi bật
            </Badge>
            <Text
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="900"
              letterSpacing="-0.035em"
              lineHeight="1"
              mb={4}
            >
              Ưu đãi tháng này
            </Text>
            <Text
              fontSize={{ base: 'sm', md: 'lg' }}
              lineHeight="1.75"
              maxW="680px"
              noOfLines={{ base: 4, md: 3 }}
              color="whiteAlpha.900"
            >
              {description}
            </Text>
          </Box>

          <Button
            as="span"
            rightIcon={<MdArrowForward />}
            bg="white"
            color="#111827"
            borderRadius="full"
            px={7}
            h="50px"
            flexShrink={0}
            _hover={{ bg: '#FED7AA' }}
          >
            Khám phá ngay
          </Button>
        </Flex>
      </Box>
    </AppContainer>
  );
}
