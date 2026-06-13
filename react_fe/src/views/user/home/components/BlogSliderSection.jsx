import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import BlogService from 'services/BlogService';
import FashionSection from 'components/ui/FashionSection';

let blogCache = null;

const excerptFromHtml = (html) =>
  (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export default function BlogSliderSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const textColor = useColorModeValue('gray.900', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    let isMounted = true;

    const fetchLatestBlogs = async () => {
      try {
        if (blogCache && isMounted) {
          setBlogs(blogCache);
          setLoading(false);
        } else {
          setLoading(true);
        }

        const res = await BlogService.getAll({ page: 0, size: 10 });
        const data = res.data.content || [];

        if (!isMounted) return;

        setBlogs(data);
        blogCache = data;
        setLoading(false);
      } catch (err) {
        console.error('Lỗi load blog:', err);
        if (!blogCache && isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLatestBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && !blogs.length) {
    return (
      <Flex justify="center" py={20}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }

  if (!blogs.length) return null;

  return (
    <FashionSection
      eyebrow="Style journal"
      title="Phong cách & câu chuyện mới"
      description="Các bài viết giúp khách hàng ở lại lâu hơn thay vì chỉ lướt qua sản phẩm."
      actionText="Xem tất cả"
      actionTo="/user/blog"
      py={{ base: 10, md: 16 }}
    >
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {blogs.slice(0, 3).map((blog, index) => (
          <Box
            key={blog.id}
            as={RouterLink}
            to={`/user/blog/detail/${blog.slug}`}
            display="block"
            bg="white"
            borderRadius="24px"
            overflow="hidden"
            h="100%"
            border="1px solid"
            borderColor="blackAlpha.100"
            boxShadow={index === 0 ? '0 22px 54px rgba(15, 23, 42, 0.14)' : 'none'}
            transition="transform 0.25s ease, box-shadow 0.25s ease"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: '0 22px 54px rgba(15, 23, 42, 0.16)',
              '& img': { transform: 'scale(1.04)' },
            }}
          >
            <Box overflow="hidden" h={{ base: '220px', md: index === 0 ? '280px' : '220px' }}>
              {blog.thumbnail ? (
                <Image
                  src={blog.thumbnail}
                  alt={blog.title}
                  h="100%"
                  w="100%"
                  objectFit="cover"
                  transition="transform 0.35s ease"
                />
              ) : (
                <Flex
                  h="100%"
                  w="100%"
                  bg="#111827"
                  align="center"
                  justify="center"
                  color="white"
                  fontSize="xl"
                  fontWeight="900"
                >
                  Trendify Journal
                </Flex>
              )}
            </Box>
            <Box p={{ base: 5, md: 6 }}>
              <Text fontSize="xs" fontWeight="900" color="#F97316" mb={3}>
                {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
              </Text>
              <Text fontWeight="900" fontSize={{ base: 'xl', md: '2xl' }} noOfLines={2} color={textColor} mb={3}>
                {blog.title}
              </Text>
              <Text fontSize="sm" color={subTextColor} noOfLines={3}>
                {excerptFromHtml(blog.content).slice(0, 140)}...
              </Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </FashionSection>
  );
}
