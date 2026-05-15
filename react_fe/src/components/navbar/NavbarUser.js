// src/components/navbar/NavbarUser.jsx
import {
  Text,
  Flex,
  useColorModeValue,
  Image,
  IconButton,
  useBreakpointValue,
  Icon,
  Box,
} from '@chakra-ui/react';
import React, { useState, useRef } from 'react';
import NavbarLinks from 'components/navbar/NavbarLinks';
import { MdMenu, MdSearch } from 'react-icons/md';
import SearchOverlay from 'components/navbar/searchBar/SearchOverlay';
import logo from 'assets/img/auth/auth.png';
import MegaMenu from 'components/navbar/megaMenu/MegaMenu';
import { useNavigate } from 'react-router-dom';
import { useCategories } from 'contexts/CategoryContext';

// ─── SubCategoryItem: menu cháu ───
function SubCategoryItem({ child, grandchildren, onNavigate, colors }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <Box
      position="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Flex
        px={4}
        py="9px"
        cursor="pointer"
        fontSize="sm"
        fontWeight="500"
        color={colors.textColor}
        borderRadius="8px"
        mx={2}
        transition="all 0.15s"
        justify="space-between"
        align="center"
        _hover={{
          bg: colors.hoverBg,
          color: colors.activeColor,
          pl: 5,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(child);
          setOpen(false);
        }}
      >
        <Text>{child.name}</Text>
        {grandchildren.length > 0 && (
          <Text fontSize="10px" opacity={0.6}>▶</Text>
        )}
      </Flex>

      {/* ─── Dropdown menu cháu ─── */}
      {open && grandchildren.length > 0 && (
        <Box
          position="absolute"
          top="0"
          left="100%"
          bg={colors.dropdownBg}
          border="1px solid"
          borderColor={colors.borderColor}
          borderRadius="12px"
          boxShadow="0 8px 32px rgba(0,0,0,0.12)"
          minW="200px"
          py={2}
          zIndex={2001}
          style={{ animation: 'dropdownFadeIn 0.15s ease' }}
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '-15px',
            width: '15px',
            bg: 'transparent'
          }}
        >
          {grandchildren.map((gc) => (
            <Box
              key={gc.id}
              px={4}
              py="9px"
              cursor="pointer"
              fontSize="sm"
              fontWeight="500"
              color={colors.textColor}
              borderRadius="8px"
              mx={2}
              transition="all 0.15s"
              _hover={{
                bg: colors.hoverBg,
                color: colors.activeColor,
                pl: 5,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(gc);
                setOpen(false);
              }}
            >
              {gc.name}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── CategoryItem: mỗi danh mục cấp 1 có hover dropdown ───
function CategoryItem({ cat, children, allCategories, onNavigate, colors }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <Box
      position="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ─── Tên danh mục cấp 1 ─── */}
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
        _after={{
          content: '""',
          display: 'block',
          height: '2px',
          bg: colors.activeColor,
          borderRadius: '1px',
          transform: open ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.2s ease',
          transformOrigin: 'left',
          mt: '2px',
        }}
      >
        {cat.name}
      </Text>

      {/* ─── Dropdown danh mục con ─── */}
      {open && children.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left="50%"
          transform="translateX(-50%)"
          mt="4px"
          bg={colors.dropdownBg}
          border="1px solid"
          borderColor={colors.borderColor}
          borderRadius="12px"
          boxShadow="0 8px 32px rgba(0,0,0,0.12)"
          minW="200px"
          py={2}
          zIndex={2000}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ animation: 'dropdownFadeIn 0.15s ease' }}
          _after={{
            content: '""',
            position: 'absolute',
            top: '-15px',
            left: 0,
            right: 0,
            height: '15px',
            bg: 'transparent'
          }}
        >
          {/* Mũi tên nhỏ */}
          <Box
            position="absolute"
            top="-6px"
            left="50%"
            transform="translateX(-50%)"
            w="12px"
            h="6px"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: '4px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              w: '8px',
              h: '8px',
              bg: colors.dropdownBg,
              border: '1px solid',
              borderColor: colors.borderColor,
            }}
          />

          {children.map((child) => {
            const grandchildren = allCategories.filter((c) => c.parentId === child.id);
            return (
              <SubCategoryItem
                key={child.id}
                child={child}
                grandchildren={grandchildren}
                onNavigate={(item) => {
                  onNavigate(item);
                  setOpen(false);
                }}
                colors={colors}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}

// ─── NavbarUser ───────────────────────────────────────────
export default function NavbarUser() {
  const navbarBg = useColorModeValue('white', 'navy.800');
  const navbarBorder = useColorModeValue('rgba(11,20,55,0.1)', 'navy.600');
  const textColor = useColorModeValue('gray.700', 'white');
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  const dropdownBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'navy.600');
  const hoverBg = useColorModeValue('gray.50', 'navy.700');
  const menuIconHoverBg = useColorModeValue('gray.100', 'navy.700');

  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { categories, loading } = useCategories();

  // Cấp 1
  const parentCategories = categories.filter((c) => !c.parentId);
  // Lấy con theo cha
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
      {/* CSS animation cho dropdown */}
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
        boxShadow="0 1px 8px rgba(0,0,0,0.07)"
      >
        <Flex
          w="100%"
          h={{ base: '64px', md: '68px' }}
          align="center"
          px={{ base: 4, md: 8, lg: 16 }}
          mx="auto"
          maxW="1440px"
        >
          {/* ━━━ LEFT: Logo (flex: 1) ━━━ */}
          <Box flex="1" display="flex" alignItems="center">
            <Image
              src={logo}
              alt="Trendify Logo"
              h={{ base: '44px', md: '50px' }}
              onClick={() => navigate('/')}
              cursor="pointer"
              _hover={{ opacity: 0.82 }}
              transition="opacity 0.2s"
              flexShrink={0}
            />
          </Box>

          {/* ━━━ CENTER: Danh mục (Desktop) ━━━ */}
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

          {/* ━━━ RIGHT: Icons (flex: 1, justify-end) ━━━ */}
          <Flex
            flex="1"
            align="center"
            justify="flex-end"
            gap={1}
          >
            {/* Search Icon */}
            <IconButton
              aria-label="Tìm kiếm"
              icon={<Icon as={MdSearch} boxSize={6} />}
              variant="ghost"
              color={textColor}
              _hover={{ bg: menuIconHoverBg }}
              onClick={() => setIsSearchOpen(true)}
              size="md"
            />
            {/* Icon 3 gạch – ngay bên trái giỏ hàng */}
            <IconButton
              aria-label="Mở danh mục"
              icon={<Icon as={MdMenu} boxSize={6} />}
              variant="ghost"
              color={textColor}
              _hover={{ bg: menuIconHoverBg }}
              onClick={() => setMegaMenuOpen((prev) => !prev)}
              size="md"
            />

            {/* Cart + Dark mode + Avatar */}
            <NavbarLinks />
          </Flex>
        </Flex>

        {/* ━━━ MegaMenu ━━━ */}
        {isMegaMenuOpen && !loading && (
          <MegaMenu
            categories={categories}
            onClose={() => setMegaMenuOpen(false)}
          />
        )}
      </Box>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
