// src/components/navbar/NavbarUser.jsx
import {
  Text,
  Flex,
  useColorModeValue,
  Image,
  IconButton,
  useBreakpointValue,
  Icon,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import NavbarLinks from 'components/navbar/NavbarLinks';
import logo from 'assets/img/auth/auth.png';
import { MdMenu } from 'react-icons/md';
import MegaMenu from 'components/navbar/megaMenu/MegaMenu';
import { useNavigate } from 'react-router-dom';
import { useCategories } from 'contexts/CategoryContext';

export default function NavbarUser() {
  const navbarBg = useColorModeValue('white', 'navy.800');
  const navbarBorder = useColorModeValue('rgba(11,20,55,0.1)', 'navy.600');
  const textColor = useColorModeValue('gray.600', 'white');
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);

  // 🧩 Lấy categories từ context
  const { categories, loading } = useCategories();

  return (
    <Flex
      w="100%"
      minH="75px"
      bg={navbarBg}
      borderBottom="1px solid"
      borderColor={navbarBorder}
      boxShadow="sm" // 👈 thêm nhẹ để nhìn rõ header
      align="center"
      justify="space-between"
      px={{ base: 4, md: 20 }}
      zIndex="10"
    >
      {/* 🔹 Left section */}
      {!isMegaMenuOpen && !isMobile && (
        <Flex
          align="center"
          gap={2}
          cursor="pointer"
          borderWidth="2px"
          borderColor="rgba(0,0,0,0.2)"
          borderRadius={20}
          px={5}
          py={2}
          onClick={() => setMegaMenuOpen(true)}
        >
          <Icon as={MdMenu} color={textColor} boxSize={6} />
          <Text fontWeight="semibold" fontSize="md" color={textColor}>
            Danh Mục
          </Text>
        </Flex>
      )}

      {/* 🔹 Logo center */}
      <Image
        src={logo}
        alt="Logo"
        h="60px"
        onClick={() => navigate('/')}
        _hover={{ cursor: 'pointer' }}
      />

      {/* 🔹 Right links */}
      <Flex align="center" gap={4}>
        <NavbarLinks />
        {isMobile && (
          <IconButton
            aria-label="Menu"
            icon={<MdMenu color="black" />}
            bg="transparent"
            fontSize="28px"
            _hover={{ bg: 'transparent' }}
            onClick={() => setMegaMenuOpen((prev) => !prev)}
          />
        )}
      </Flex>

      {/* 🧩 Mega menu */}
      {isMegaMenuOpen && !loading && (
        <MegaMenu
          categories={categories}
          onClose={() => setMegaMenuOpen(false)}
        />
      )}
    </Flex>
  );
}
