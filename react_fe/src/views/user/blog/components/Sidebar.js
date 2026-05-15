import { VStack, HStack, Image, Text, Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function BlogSidebar({ blogs }) {
  const navigate = useNavigate();
  if (!blogs?.length) return null;

  return (
    <VStack align="stretch" spacing={4}>
      {blogs.map((b) => (
        <HStack
          key={b.id}
          spacing={3}
          align="start"
          cursor="pointer"
          onClick={() => navigate(`/user/blog/detail/${b.slug}`)}
        >
          {b.thumbnail ? (
            <Image
              src={b.thumbnail}
              alt={b.title}
              boxSize="80px"
              objectFit="cover"
              borderRadius="md"
            />
          ) : (
            <Box boxSize="80px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center" color="gray.500" fontSize="xs" fontWeight="bold" textAlign="center">Trendify</Box>
          )}
          <Box>
            <Text fontWeight="bold" noOfLines={2}>{b.title}</Text>
            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              <span dangerouslySetInnerHTML={{ __html: b.content.slice(0, 80) + '...' }} />
            </Text>
          </Box>
        </HStack>
      ))}
    </VStack>
  );
}
