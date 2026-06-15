import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Collapse,
  IconButton,
  Grid,
  useColorModeValue,
  Flex,
  Image,
  Divider,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  MdExpandMore,
  MdClose,
  MdArrowBack,
  MdChevronRight,
  MdStorefront,
  MdArticle,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import Clothe from 'assets/img/megamenu/clothe.png';
import Blog from 'assets/img/megamenu/blog.png';

const MotionIconButton = motion(IconButton);
const MotionBox = motion(Box);

export default function MegaMenu({ categories, onClose }) {
  const navbarBg = useColorModeValue('fashion.pageBg', 'navy.800');
  const navbarBorder = useColorModeValue('fashion.stone', 'navy.600');
  const itemBg = useColorModeValue('fashion.softSurface', 'navy.700');
  const hoverBg = useColorModeValue('brand.50', 'navy.600');
  const overlayBg = useColorModeValue('rgba(246,240,232,0.95)', 'rgba(11,20,55,0.95)');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState({});
  const [currentParentId, setCurrentParentId] = useState(null);
  const [currentSubParentId, setCurrentSubParentId] = useState(null);

  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  const parents = categories.filter((c) => !c.parentId);
  const desktopParentColumns = Math.max(parents.length, 1);
  const getChildren = (parentId) =>
    categories.filter((c) => c.parentId === parentId);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleNavigate = (catId) => {
    const category = categories.find((c) => c.id === catId);
    if (!category) return;
    navigate(`/user/product/${category.slug}`);
    setExpanded({});
    setCurrentParentId(null);
    setCurrentSubParentId(null);
    onClose?.();
  };

  return (
    <MotionBox
        key="megamenu"
        position="fixed"
        top={0}
        left={0}
        w="100vw"
        h="100vh"
        bg={overlayBg}
        zIndex={2000}
        backdropFilter="blur(10px)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Box position="absolute" inset={0} onClick={onClose} />

        {/* Content */}
        <MotionBox
          position="relative"
          w="100%"
          h="100vh"
          bg={navbarBg}
          overflowY="auto"
          boxShadow="0 20px 60px rgba(0,0,0,0.14)"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box maxW="1440px" mx="auto" px={{ base: 4, md: 8, xl: 10 }} py={{ base: 4, md: 7 }}>
            <Flex
              align="center"
              justify="space-between"
              pb={4}
              mb={{ base: 4, md: 6 }}
              borderBottom="1px solid"
              borderColor={navbarBorder}
            >
              <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold">
                Menu
              </Text>
              <IconButton
                aria-label="Đóng menu"
                icon={<MdClose size={24} />}
                variant="ghost"
                borderRadius="full"
                onClick={onClose}
                _hover={{ bg: hoverBg }}
              />
            </Flex>
            {isMobile ? (
              <VStack align="start" spacing={0} w="100%">
                {/* 🧭 Shop + Blogs (ẩn khi vào cấp 2 hoặc cấp 3) */}
                {currentParentId === null && currentSubParentId === null && (
                  <>
                    <VStack align="stretch" w="100%" spacing={2} mb={4}>
                      {/* Shop */}
                      <Flex
                        align="center"
                        justify="space-between"
                        bg={itemBg}
                        px={4}
                        py={3}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => {
                          navigate('/user/product');
                          onClose?.();
                        }}
                        _hover={{ bg: hoverBg }}
                      >
                        <HStack spacing={3}>
                          <MdStorefront size={22} />
                          <Text fontWeight="semibold">Sản Phẩm</Text>
                        </HStack>
                        <MdChevronRight size={22} />
                      </Flex>

                      {/* Blogs */}
                      <Flex
                        align="center"
                        justify="space-between"
                        bg={itemBg}
                        px={4}
                        py={3}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => {
                          navigate('/user/blog');
                          onClose?.();
                        }}
                        _hover={{ bg: hoverBg }}
                      >
                        <HStack spacing={3}>
                          <MdArticle size={22} />
                          <Text fontWeight="semibold">Bài viết</Text>
                        </HStack>
                        <MdChevronRight size={22} />
                      </Flex>
                    </VStack>

                    {/* Divider */}
                    <Divider
                      borderColor={navbarBorder}
                      borderWidth="1px"
                      opacity={0.8}
                    />
                  </>
                )}

                {/* 🗂 Category Section */}
                <Box w="100%" pt={4}>
                  {/* Level 1 */}
                  {currentParentId === null &&
                    parents.map((p, index) => (
                      <Flex
                        key={p.id}
                        justify="space-between"
                        align="center"
                        bg={itemBg} // 👉 chỉ cấp 1 có nền xám
                        _hover={{ bg: hoverBg }}
                        px={4}
                        py={3}
                        borderRadius="md"
                        mb={2}
                        cursor="pointer"
                        onClick={() => {
                          if (getChildren(p.id).length > 0)
                            setCurrentParentId(p.id);
                          else handleNavigate(p.id);
                        }}
                      >
                        <Text fontWeight="bold" textTransform="uppercase">
                          {p.name}
                        </Text>
                        {getChildren(p.id).length > 0 && (
                          <MdChevronRight fontSize={24} />
                        )}
                      </Flex>
                    ))}

                  {/* Level 2 */}
                  {currentParentId !== null && currentSubParentId === null && (
                    <VStack w="100%" spacing={1}>
                      {/* Back */}
                      <Flex
                        w="100%"
                        align="center"
                        position="relative"
                        cursor="pointer"
                        onClick={() => setCurrentParentId(null)}
                        py={3}
                        borderBottom="1px solid"
                        borderColor={navbarBorder}
                        mb={2}
                      >
                        <Box position="absolute" left={2}>
                          <MdArrowBack />
                        </Box>
                        <Text
                          fontWeight="bold"
                          textAlign="center"
                          w="100%"
                          textTransform="uppercase"
                        >
                          {parents.find((p) => p.id === currentParentId)?.name}
                        </Text>
                      </Flex>

                      {/* Danh mục cấp 2 */}
                      {getChildren(currentParentId).map((c2) => (
                        <Box key={c2.id} w="100%">
                          <Flex
                            justify="space-between"
                            align="center"
                            // ❌ bỏ bg, chỉ giữ hover
                            _hover={{ bg: hoverBg }}
                            px={4}
                            py={3}
                            borderRadius="md"
                            mb={1}
                            cursor="pointer"
                            onClick={() => toggleExpand(c2.id)}
                          >
                            <Text>{c2.name}</Text>
                            {getChildren(c2.id).length > 0 && (
                              <MdExpandMore
                                size={22}
                                style={{
                                  transform: expanded[c2.id]
                                    ? 'rotate(180deg)'
                                    : 'rotate(0deg)',
                                  transition: '0.2s ease',
                                }}
                              />
                            )}
                          </Flex>

                          {/* Collapse cấp 3 */}
                          <Collapse in={expanded[c2.id]} animateOpacity>
                            <VStack align="start" pl={6} spacing={1} mt={1}>
                              <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color="brand.500"
                                cursor="pointer"
                                _hover={{ color: 'brand.400' }}
                                onClick={() => handleNavigate(c2.id)}
                              >
                                Tất Cả
                              </Text>
                              {getChildren(c2.id).map((c3) => (
                                <Text
                                  key={c3.id}
                                  fontSize="sm"
                                  cursor="pointer"
                                  _hover={{ color: 'brand.500' }}
                                  onClick={() => handleNavigate(c3.id)}
                                >
                                  {c3.name}
                                </Text>
                              ))}
                            </VStack>
                          </Collapse>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>
              </VStack>
            ) : (
              // 🖥️ Desktop giữ nguyên
              <Grid
                templateColumns={{ md: 'repeat(3, minmax(0, 1fr)) 1.35fr', xl: `repeat(${desktopParentColumns}, minmax(0, 1fr)) 1.45fr` }}
                gap={{ md: 7, xl: 9 }}
              >
                {parents.map((p, idx) => (
                  <VStack
                    key={p.id}
                    align="start"
                    spacing={4}
                    pr={{ md: 5, xl: 6 }}
                    borderRight={
                      idx !== parents.length - 1 ? '1px solid' : 'none'
                    }
                    borderColor={navbarBorder}
                  >
                    <Text
                      fontSize={{ md: 'xl', xl: '2xl' }}
                      fontWeight="bold"
                      textTransform="uppercase"
                      cursor="pointer"
                      onClick={() => handleNavigate(p.id)}
                      _hover={{ color: 'brand.500' }}
                    >
                      {p.name}
                    </Text>

                    {getChildren(p.id).map((c2) => (
                      <Box key={c2.id} w="100%">
                        <Flex
                          justify="space-between"
                          align="center"
                          cursor="pointer"
                          onClick={() => toggleExpand(c2.id)}
                        >
                          <Text fontSize={{ md: 'md', xl: 'lg' }} fontWeight="600">{c2.name}</Text>
                          {getChildren(c2.id).length > 0 && (
                            <MotionIconButton
                              aria-label="expand"
                              icon={<MdExpandMore />}
                              size="sm"
                              variant="ghost"
                              animate={{ rotate: expanded[c2.id] ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </Flex>

                        <Collapse in={expanded[c2.id]} animateOpacity>
                          <VStack align="start" pl={4} spacing={1} mt={1}>
                            <Text
                              key={`${c2.id}-all`}
                              fontSize="md"
                              cursor="pointer"
                              _hover={{ color: 'brand.500' }}
                              onClick={() => handleNavigate(c2.id)}
                              fontWeight="semibold"
                              color="brand.500"
                            >
                              Tất Cả
                            </Text>
                            {getChildren(c2.id).map((c3) => (
                              <Text
                                key={c3.id}
                                fontSize="md"
                                cursor="pointer"
                                _hover={{ color: 'brand.500' }}
                                onClick={() => handleNavigate(c3.id)}
                              >
                                {c3.name}
                              </Text>
                            ))}
                          </VStack>
                        </Collapse>
                      </Box>
                    ))}
                  </VStack>
                ))}

                {/* Extra column */}
                <VStack align="stretch" spacing={4} pl={{ md: 3, xl: 5 }}>
                  <Box
                    borderRadius="20px"
                    shadow="md"
                    bg="fashion.softSurface"
                    _dark={{ bg: 'navy.700' }}
                    cursor="pointer"
                    overflow="hidden"
                    _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    onClick={() => {
                      navigate('/user/product');
                      onClose?.();
                    }}
                  >
                    <Image
                      src={Clothe}
                      alt="Danh mục sản phẩm"
                      w="100%"
                      h={{ md: '240px', xl: '300px' }}
                      objectFit="contain"
                      objectPosition="center"
                      bg="fashion.pageBg"
                      p={{ md: 1, xl: 2 }}
                    />
                    <Box p={{ md: 4, xl: 5 }}>
                      <Text fontSize={{ md: 'xl', xl: '2xl' }} fontWeight="bold" mb={2}>
                        Khám phá sản phẩm
                      </Text>
                      <Text fontSize={{ md: 'sm', xl: 'md' }} color="gray.500">
                        Xem tất cả danh mục, hàng mới về và những mẫu đang được quan tâm.
                      </Text>
                    </Box>
                  </Box>

                  <Box
                    borderRadius="20px"
                    shadow="md"
                    bg="fashion.softSurface"
                    _dark={{ bg: 'navy.700' }}
                    cursor="pointer"
                    overflow="hidden"
                    _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    onClick={() => {
                      navigate('/user/blog');
                      onClose?.();
                    }}
                  >
                    <Image
                      src={Blog}
                      alt="Bài viết phong cách"
                      w="100%"
                      h={{ md: '210px', xl: '250px' }}
                      objectFit="contain"
                      objectPosition="center"
                      bg="fashion.pageBg"
                      p={{ md: 1, xl: 2 }}
                    />
                    <Box p={{ md: 4, xl: 5 }}>
                      <Text fontSize={{ md: 'xl', xl: '2xl' }} fontWeight="bold" mb={2}>
                        Xem bài viết
                      </Text>
                      <Text fontSize={{ md: 'sm', xl: 'md' }} color="gray.500">
                        Mẹo phối đồ, xu hướng và câu chuyện thời trang từ Trendify.
                      </Text>
                    </Box>
                  </Box>
                </VStack>
              </Grid>
            )}
          </Box>
        </MotionBox>
      </MotionBox>
  );
}
