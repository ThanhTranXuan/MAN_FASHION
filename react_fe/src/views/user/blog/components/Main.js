import { Box, Image, Text, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function BlogMain({ blog }) {
  const navigate = useNavigate();
  if (!blog) return null;

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      onClick={() => navigate(`/user/blog/detail/${blog.slug}`)}
    >
      <Image src={blog.thumbnail} alt={blog.title} objectFit="cover" w="100%" h="300px" />
      <Box p={4}>
        <Heading size="md" mb={2}>{blog.title}</Heading>
        <Text noOfLines={3} color="gray.600">
          {/* Nếu content là HTML đã xử lý, lấy textContent hoặc truncate */}
          <span dangerouslySetInnerHTML={{ __html: blog.content.slice(0, 150) + '...' }} />
        </Text>
      </Box>
    </Box>
  );
}
