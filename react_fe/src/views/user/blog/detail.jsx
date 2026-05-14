import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Image,
  Spinner,
  Flex,
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbItem,
  useColorModeValue,
} from '@chakra-ui/react';
import BlogService from 'services/BlogService';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const textColor = useColorModeValue('gray.800', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.300');
  const breadcrumbColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await BlogService.getBySlug(slug);
        setBlog(res.data);
      } catch (err) {
        console.error('Failed to fetch blog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (!blog) return <Text textAlign="center">Không tìm thấy bài viết</Text>;

  return (
    <Box px={{ base: 6, md: 20 }} py={{ base: 5, md: 10 }}>
      {/* 🧭 Breadcrumb */}
      <Breadcrumb
        fontWeight="medium"
        fontSize="sm"
        mb={6}
        separator="/"
        sx={{
          display: 'flex',
          flexWrap: 'wrap !important', // ✅ ép xuống dòng
          whiteSpace: 'normal',
          '& > ol': {
            display: 'flex',
            flexWrap: 'wrap !important', // ✅ ép danh sách xuống dòng
            alignItems: 'center',
            gap: '4px',
            lineHeight: '1.6',
          },
          '& li': {
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            whiteSpace: 'normal',
            maxWidth: '100%',
          },
        }}
      >
        <BreadcrumbItem>
          <BreadcrumbLink
            color={breadcrumbColor}
            onClick={() => navigate('/')}
            _hover={{ color: brandColor }}
            whiteSpace="normal"
          >
            Trang Chủ
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink
            color={breadcrumbColor}
            onClick={() => navigate('/user/blog')}
            _hover={{ color: brandColor }}
            whiteSpace="normal"
          >
            Blog của Trendify
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            color={textColor}
            display="inline-block"
            whiteSpace="normal"
            wordBreak="keep-all"
            maxW={{ base: '90vw', md: '100%' }} // ✅ hạn chế tràn khi mobile
          >
            {blog.title}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading mb={4}>{blog.title}</Heading>
      <Text fontSize="sm" color="gray.400" mb={6}>
        {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
      </Text>

      <Image
        src={blog.thumbnail}
        alt={blog.title}
        borderRadius="lg"
        mb={6}
        w="100%"
      />

      <Text
        fontSize="md"
        lineHeight="1.8"
        color={textColor}
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </Box>
  );
}
