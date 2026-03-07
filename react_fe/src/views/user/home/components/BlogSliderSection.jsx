// src/views/user/home/components/BlogSliderSection.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Image,
  Flex,
  Spinner,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import BlogService from 'services/BlogService';
import { Swiper, SwiperSlide } from 'swiper/react';

// 🧠 Cache blog ở mức module – sống cùng vòng đời app, không mất khi đổi route
let blogCache = null;

export default function BlogSliderSection() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    let isMounted = true;

    const fetchLatestBlogs = async () => {
      try {
        // ✅ Nếu đã có cache → hiển thị ngay, không spinner trắng
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
        blogCache = data; // 🧠 cập nhật cache
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

  // ✅ Chỉ hiện spinner nếu đang loading và chưa có data
  if (loading && !blogs.length) {
    return (
      <Flex justify="center" py={20}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!blogs.length) return null;

  return (
    <Box py={10} px={{ base: 4, md: 20 }}>
      <Flex justify="space-between" align="center" mb={8}>
        <Text
          fontSize={{ base: '2xl', md: '4xl' }}
          fontWeight="bold"
          bgGradient="linear(to-r, teal.500, purple.600)"
          bgClip="text"
        >
          Fashion Trends & Blog
        </Text>
        <Button
          variant="outline"
          colorScheme="purple"
          size="sm"
          onClick={() => navigate('/user/blog')}
          borderRadius="full"
        >
          View All
        </Button>
      </Flex>

      <Swiper
        spaceBetween={20}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        grabCursor
        style={{ paddingBottom: '10px' }}
      >
        {blogs.map((blog) => (
          <SwiperSlide key={blog.id}>
            <Box
              bg={bg}
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="md"
              cursor="pointer"
              h="100%"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-12px)',
                shadow: 'lg',
              }}
              onClick={() => navigate(`/user/blog/detail/${blog.slug}`)}
            >
              <Image
                src={blog.thumbnail}
                alt={blog.title}
                h="200px"
                w="100%"
                objectFit="cover"
              />
              <Box p={5}>
                <Text
                  fontWeight="bold"
                  fontSize="lg"
                  noOfLines={2}
                  color={textColor}
                >
                  {blog.title}
                </Text>
                <Text fontSize="sm" color={subTextColor} mt={2} noOfLines={3}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        (blog.content || '')
                          .replace(/<[^>]*>/g, '')
                          .slice(0, 120) + '...',
                    }}
                  />
                </Text>
                <Text fontSize="xs" color="gray.500" mt={3}>
                  {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
