import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Grid,
  Spinner,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import Main from './components/Main';
import Sidebar from './components/Sidebar';
import List from './components/List';
import BlogService from 'services/BlogService';
import { useNavigate } from 'react-router-dom';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const navigate = useNavigate();

  const breadcrumbColor = useColorModeValue('gray.500', 'gray.400');
  const brandColor = useColorModeValue('brand.500', 'brand.300');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const fetchBlogs = async (pageNum = 0) => {
    setIsLoading(true);
    try {
      const res = await BlogService.getAll({ page: pageNum, size: 7 });
      const newData = res.data.content || [];
      if (pageNum === 0) setBlogs(newData);
      else setBlogs((prev) => [...prev, ...newData]);
      setHasMore(!res.last);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(0);
  }, []);

  // infinite scroll trigger
  const lastBlogRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore],
  );

  useEffect(() => {
    if (page > 0) fetchBlogs(page);
  }, [page]);

  const mainBlog = blogs[0];
  const sidebarBlogs = blogs.slice(1, 5);
  const gridBlogs = blogs.slice(5);

  return (
    <Box maxW="7xl" mx="auto" py={{ base: 5, md: 10 }} px={6}>
      {/* 🧭 Breadcrumb */}
      <Breadcrumb fontWeight="medium" fontSize="md" mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink
            color={breadcrumbColor}
            onClick={() => navigate('/')}
            _hover={{ color: brandColor }}
          >
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink color={textColor}>Trendify's Blogs</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* 🧭 Layout */}
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
        <Main blog={mainBlog} />
        <Sidebar blogs={sidebarBlogs} />
      </Grid>

      <List blogs={gridBlogs} lastBlogRef={lastBlogRef} />

      {isLoading && (
        <Flex justify="center" py={4}>
          <Spinner />
        </Flex>
      )}
    </Box>
  );
}
