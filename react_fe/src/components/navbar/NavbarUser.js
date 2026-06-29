
import {
  Text,
  Flex,
  useColorModeValue,
  Image,
  IconButton,
  useBreakpointValue,
  Icon,
  Box,
  Grid
} from '@chakra-ui/react';
import React, { useState, useRef } from 'react';
import NavbarLinks from 'components/navbar/NavbarLinks';
import { MdMenu, MdSearch } from 'react-icons/md';
import SearchOverlay from 'components/navbar/searchBar/SearchOverlay';
import logo from 'assets/img/auth/auth.png';
import MegaMenu from 'components/navbar/megaMenu/MegaMenu';
import { useNavigate } from 'react-router-dom';
import { useCategories } from 'contexts/CategoryContext';
import { AnimatePresence } from 'framer-motion';
import { hideChatWidget, showChatWidget } from 'utils/NavigationHelper';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8080';

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getCategoryThumbnail = (category, fallbackCategory) => {
  const thumbnail =
    category?.thumbnailUrl ||
    category?.thumbnail_url ||
    category?.imageUrl ||
    category?.thumbnail ||
    fallbackCategory?.thumbnailUrl ||
    fallbackCategory?.thumbnail_url ||
    fallbackCategory?.imageUrl ||
    fallbackCategory?.thumbnail ||
    '';

  return resolveImageUrl(thumbnail);
};

function CategoryThumbnail({ category, fallbackCategory }) {
  const [failed, setFailed] = useState(false);
  const thumbnail = getCategoryThumbnail(category, fallbackCategory);

  if (!thumbnail || failed) {
    return (
      <Flex
        w="100%"
        h="100%"
        align="flex-end"
        bg="linear-gradient(135deg, #F6F0E8 0%, #E7E1D8 48%, #111827 100%)"
        p={4}
      >
        <Text
          color="white"
          fontSize="sm"
          fontWeight="800"
          textTransform="uppercase"
          textShadow="0 2px 10px rgba(0,0,0,0.35)"
        >
          {category.name}
        </Text>
      </Flex>
    );
  }

  return (
    <Image
      src={thumbnail}
      alt={category.name}
      w="100%"
      h="100%"
      objectFit="contain"
      objectPosition="center"
      bg="fashion.softSurface"
      p={{ base: 1, md: 2 }}
      transition="transform 0.3s ease"
      onError={() => setFailed(true)}
    />
  );
}


function CategoryItem({ cat, children, allCategories, onNavigate, colors }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      h="100%"
      display="flex"
      alignItems="center"
    >
      <Text
        fontSize="sm"
        fontWeight="700"
        textTransform="uppercase"
        letterSpacing="wider"
        whiteSpace="nowrap"
        color={open ? colors.activeColor : colors.textColor}
        cursor="pointer"
        px={1}
        py={2}
        onClick={() => onNavigate(cat)}
        transition="color 0.15s"
        position="relative"
        _after={{
          content: '""',
          display: 'block',
          height: '2px',
          bg: colors.activeColor,
          borderRadius: '1px',
          transform: open ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.2s ease',
          transformOrigin: 'left',
          position: 'absolute',
          bottom: '0px',
          left: 0,
          right: 0
        }}
      >
        {cat.name}
      </Text>

      <Box
          position="fixed"
          top={{ base: '64px', md: '68px' }}
          left={0}
          w="100vw"
          bg={colors.dropdownBg}
          boxShadow="0 18px 44px rgba(15,23,42,0.12)"
          borderTop="1px solid"
          borderColor={colors.borderColor}
          zIndex={2000}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          opacity={open && children.length > 0 ? 1 : 0}
          visibility={open && children.length > 0 ? 'visible' : 'hidden'}
          transform={open && children.length > 0 ? 'translateY(0)' : 'translateY(-10px)'}
          pointerEvents={open && children.length > 0 ? 'auto' : 'none'}
          transition="opacity 240ms cubic-bezier(0.22, 1, 0.36, 1), transform 240ms cubic-bezier(0.22, 1, 0.36, 1), visibility 240ms"
          willChange="opacity, transform"
        >
          <Box maxW="1280px" mx="auto" px={{ md: 8, xl: 10 }} py={{ md: 6, xl: 8 }} maxH="calc(100vh - 88px)" overflowY="auto">
            <Grid templateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={{ md: 6, xl: 8 }}>
              {children.map((child) => {
                const grandchildren = allCategories.filter((c) => c.parentId === child.id);
                return (
                  <Box key={child.id}>
                    <Box
                      w="100%"
                      h={{ md: '180px', xl: '220px' }}
                      borderRadius="12px"
                      overflow="hidden"
                      mb={3}
                      cursor="pointer"
                      onClick={() => {
                        onNavigate(child);
                        setOpen(false);
                      }}
                      bg="fashion.softSurface"
                      border="1px solid"
                      borderColor={colors.borderColor}
                      _hover={{ '& img': { transform: 'scale(1.01)' } }}
                    >
                      <CategoryThumbnail
                        category={child}
                        fallbackCategory={cat}
                      />
                    </Box>

                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      mb={3}
                      cursor="pointer"
                      onClick={() => {
                        onNavigate(child);
                        setOpen(false);
                      }}
                      _hover={{ color: colors.activeColor }}
                    >
                      {child.name}
                    </Text>

                    {grandchildren.length > 0 && (
                      <Flex direction="column" gap={2}>
                        {grandchildren.map((gc) => (
                          <Text
                            key={gc.id}
                            fontSize="sm"
                            color="gray.500"
                            cursor="pointer"
                            _hover={{ color: colors.activeColor }}
                            onClick={() => {
                              onNavigate(gc);
                              setOpen(false);
                            }}
                          >
                            {gc.name}
                          </Text>
                        ))}
                      </Flex>
                    )}
                  </Box>
                );
              })}
            </Grid>
          </Box>
        </Box>
    </Box>
  );
}


export default function NavbarUser() {
  const navbarBg = useColorModeValue('fashion.cream', 'navy.800');
  const navbarBorder = useColorModeValue('rgba(11,20,55,0.1)', 'navy.600');
  const textColor = useColorModeValue('gray.700', 'white');
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  const dropdownBg = useColorModeValue('fashion.pageBg', 'navy.800');
  const borderColor = useColorModeValue('fashion.stone', 'navy.600');
  const hoverBg = useColorModeValue('gray.50', 'navy.700');
  const menuIconHoverBg = useColorModeValue('gray.100', 'navy.700');

  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { categories, loading } = useCategories();


  const parentCategories = categories.filter((c) => !c.parentId);

  const getChildren = (parentId) =>
    categories.filter((c) => c.parentId === parentId);

  const handleNavigate = (cat) => {
    navigate(`/user/product/${cat.slug}`);
  };

  const dropdownColors = {
    textColor,
    activeColor,
    dropdownBg,
    borderColor,
    hoverBg,
  };

  return (
    <>
      {}
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="1000"
        w="100%"
        bg={navbarBg}
        borderBottom="1px solid"
        borderColor={navbarBorder}
        boxShadow="0 1px 0 rgba(15,23,42,0.04)"
      >
        <Flex
          w="100%"
          h={{ base: '64px', md: '72px' }}
          align="center"
          px={{ base: 4, md: 8, xl: 12 }}
          mx="auto"
          maxW="1440px"
        >
          {}
          <Box flex="1" display="flex" alignItems="center">
            <Image
              src={logo}
              alt="Trendify Logo"
              h={{ base: '38px', md: '44px' }}
              onClick={() => navigate('/user/home', { replace: false })}
              cursor="pointer"
              _hover={{ opacity: 0.82 }}
              transition="opacity 0.2s"
              flexShrink={0}
            />
          </Box>

          {}
          {!isMobile && !loading && parentCategories.length > 0 && (
            <Flex
              as="nav"
              align="center"
              justify="center"
              gap={{ md: 6, lg: 8 }}
              flex="2"
              minW={0}
            >
              {parentCategories.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  cat={cat}
                  children={getChildren(cat.id)}
                  allCategories={categories}
                  onNavigate={handleNavigate}
                  colors={dropdownColors}
                />
              ))}
            </Flex>
          )}

          {}
          <Flex
            flex="1"
            align="center"
            justify="flex-end"
            gap={1}
          >
            {}
            <IconButton
              aria-label="Tìm kiếm"
              icon={<Icon as={MdSearch} boxSize={6} />}
              variant="ghost"
              color={textColor}
              _hover={{ bg: menuIconHoverBg }}
              onClick={() => {
                hideChatWidget();
                setMegaMenuOpen(false);
                setIsSearchOpen(true);
              }}
              size="md"
            />
            {}
            <IconButton
              aria-label="Mở danh mục"
              icon={<Icon as={MdMenu} boxSize={6} />}
              variant="ghost"
              color={textColor}
              _hover={{ bg: menuIconHoverBg }}
              onClick={() => {
                hideChatWidget();
                setMegaMenuOpen((prev) => !prev);
              }}
              size="md"
              display={{ base: 'inline-flex', md: 'none' }}
            />

            {}
            <NavbarLinks />
          </Flex>
        </Flex>

      </Box>
      {}
      <AnimatePresence>
        {isMegaMenuOpen && !loading && (
          <MegaMenu
            key="mega-menu"
            categories={categories}
            onClose={() => {
              setMegaMenuOpen(false);
              showChatWidget();
            }}
          />
        )}
      </AnimatePresence>
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          showChatWidget();
        }}
      />
    </>
  );
}
