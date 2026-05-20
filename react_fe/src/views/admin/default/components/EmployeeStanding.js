import React, { useMemo } from 'react';
import {
  Box,
  Flex,
  Avatar,
  Text,
  VStack,
  useColorModeValue,
  Icon,
  Center,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal } from 'react-icons/fa';

const MotionBox = motion(Box);

export default function EmployeeStanding({ employees = [] }) {
  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const podiumColors = {
    1: useColorModeValue('yellow.300', 'yellow.600'),
    2: useColorModeValue('gray.400', 'gray.600'),
    3: useColorModeValue('orange.400', 'orange.600'),
  };

  const sorted = useMemo(
    () =>
      [...employees].sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0)),
    [employees],
  );

  if (!employees.length) {
    return (
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
        shadow="md"
      >
        <Center py={8}>
          <Text color="gray.500">Chưa có dữ liệu nhân viên</Text>
        </Center>
      </Box>
    );
  }

  const top = sorted.slice(0, 3);
  while (top.length < 3)
    top.push({
      id: Math.random(),
      fullName: 'N/A',
      totalHours: 0,
      avatarUrl: null,
    });

  const podiumHeights = { 1: 160, 2: 120, 3: 100 };
  const podiumOrder = [1, 0, 2];
  const now = new Date();
  const month = now.toLocaleString('vi-VN', { month: 'long' });

  const getIcon = (rank) =>
    rank === 1 ? (
      <Icon as={FaTrophy} w={7} h={7} color="yellow.500" />
    ) : (
      <Icon
        as={FaMedal}
        w={7}
        h={7}
        color={rank === 2 ? 'gray.500' : 'orange.500'}
      />
    );

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius={20}
      p={6}
      h="100%"
    >
      <Text fontSize="xl" fontWeight="bold" mb={6} textAlign="center">
          Nhân viên xuất sắc - {month}
      </Text>

      <Flex justify="center" align="end" gap={8}>
        {podiumOrder.map((pos) => {
          const emp = top[pos];
          const rank = pos + 1;
          return (
            <VStack key={emp.id} spacing={3}>
              <Avatar
                size="lg"
                name={emp.fullName}
                src={emp.avatarUrl}
                mb={2}
              />
              <MotionBox
                w="100px"
                bg={podiumColors[rank]}
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                initial={{ height: 0 }}
                animate={{ height: podiumHeights[rank] }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                {getIcon(rank)}
              </MotionBox>
              <Text fontWeight="semibold">{emp.fullName}</Text>
              <Text fontSize="sm" color="gray.500">
                {emp.totalHours > 0 ? `${emp.totalHours.toFixed(1)}h` : '-'}
              </Text>
            </VStack>
          );
        })}
      </Flex>
    </Box>
  );
}
