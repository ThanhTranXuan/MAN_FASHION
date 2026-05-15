import { Grid, Box, Image, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function List({ blogs, lastBlogRef }) {
  const navigate = useNavigate();
  if (!blogs?.length) return null;

  return (
    <Grid
      templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
      gap={6}
      mt={10}
    >
      {blogs.map((b, i) => (
        <Box
          key={b.id}
          ref={i === blogs.length - 1 ? lastBlogRef : null}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          cursor="pointer"
          onClick={() => navigate(`/user/blog/detail/${b.slug}`)}
        >
          {b.thumbnail ? (
            <Image src={b.thumbnail} alt={b.title} objectFit="cover" h="200px" w="100%" />
          ) : (
            <Box h="200px" w="100%" bg="gray.200" display="flex" alignItems="center" justifyContent="center" color="gray.500" fontSize="xl" fontWeight="bold">Trendify Blog</Box>
          )}
          <Box p={3}>
            <Text fontWeight="bold" mb={1} noOfLines={2}>{b.title}</Text>
            <Text fontSize="sm" color="gray.500" noOfLines={3}>
              <span dangerouslySetInnerHTML={{ __html: b.content.slice(0, 100) + '...' }} />
            </Text>
          </Box>
        </Box>
      ))}
    </Grid>
  );
}
