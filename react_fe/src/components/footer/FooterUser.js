
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Link,
  Divider,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Input,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import NewsletterService from 'services/NewsletterService';
import { useAppToast } from 'utils/ToastHelper';
import {
  MdFacebook,
  MdOutlineLocalShipping,
} from 'react-icons/md';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';


function FooterGroup({ title, links }) {
  const headingColor = useColorModeValue('gray.500', 'gray.400');
  const linkColor = useColorModeValue('gray.700', 'gray.300');

  return (
    <VStack align="start" spacing={2}>
      <Text
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
        letterSpacing="wider"
        color={headingColor}
        mb={1}
      >
        {title}
      </Text>
      {links.map((l) => (
        <Link
          key={l.label}
          fontSize="sm"
          color={linkColor}
          href={l.href || '#'}
          _hover={{ color: 'brand.500', textDecoration: 'none' }}
          transition="color 0.15s"
          onClick={l.onClick}
        >
          {l.label}
        </Link>
      ))}
    </VStack>
  );
}


export default function FooterUser() {
  const navigate = useNavigate();
  const toast = useAppToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const bg = useColorModeValue('fashion.pageBg', 'navy.900');
  const borderTop = useColorModeValue('fashion.stone', 'navy.700');
  const shippingBg = useColorModeValue('fashion.softSurface', 'red.900');
  const shippingColor = useColorModeValue('brand.600', 'red.300');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const mutedColor = useColorModeValue('gray.500', 'gray.500');
  const copyColor = useColorModeValue('gray.500', 'gray.400');
  const iconHover = useColorModeValue('brand.500', 'brand.300');
  const inputBg = useColorModeValue('fashion.softSurface', 'navy.800');
  const inputBorder = useColorModeValue('fashion.stone', 'navy.600');
  const divider = useColorModeValue('fashion.stone', 'navy.700');

  const groups = [
    {
      title: 'Về Trendify',
      links: [
        { label: 'Giới Thiệu', href: '#' },
        { label: 'Danh Sách Cửa Hàng', href: '#' },
        { label: 'Cơ Hội Nghề Nghiệp', href: '#' },
      ],
    },
    {
      title: 'Hỗ Trợ',
      links: [
        { label: 'Câu Hỏi Thường Gặp', href: '#' },
        { label: 'Hướng Dẫn Đổi & Trả Hàng', href: '#' },
        { label: 'Chính Sách Bảo Mật', href: '#' },
        { label: 'Khả Năng Truy Cập', href: '#' },
      ],
    },
    {
      title: 'Tài Khoản',
      links: [
        {
          label: 'Tài Khoản Của Tôi',
          onClick: () => navigate('/user/profile'),
          href: '#',
        },
        {
          label: 'Hồ Sơ',
          onClick: () => navigate('/user/profile'),
          href: '#',
        },
        {
          label: 'Mã Giảm Giá',
          href: '#',
        },
      ],
    },
  ];

  const handleNewsletterSubmit = async () => {
    const email = newsletterEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setNewsletterLoading(true);
    try {
      const res = await NewsletterService.subscribe(email);
      toast.success(res?.message || 'Email ưu đãi đã được gửi');
      setNewsletterEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đăng ký nhận bản tin');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <Box as="footer" bg={bg} borderTop="1px solid" borderColor={borderTop}>
      {}
      <Box maxW="1280px" mx="auto" px={{ base: 5, md: 10 }} py={{ base: 10, md: 14 }}>

        {}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 10, md: 8 }}
          justify="space-between"
          mb={10}
        >
          {}
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3 }}
            spacing={{ base: 8, md: 10 }}
            flex="2"
          >
            {groups.map((g) => (
              <FooterGroup key={g.title} title={g.title} links={g.links} />
            ))}
          </SimpleGrid>

          {}
          <Box flex="1" minW={{ md: '220px' }} maxW={{ md: '300px' }}>
            <Text
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wider"
              color={mutedColor}
              mb={2}
            >
              Bản Tin Điện Tử
            </Text>
            <Text fontSize="sm" color={textColor} mb={4} lineHeight="1.6">
              Đăng ký nhận ưu đãi độc quyền, xu hướng thời trang và bộ sưu tập mới nhất từ Trendify.
            </Text>
            <HStack spacing={0}>
              <Input
                placeholder="Email của bạn"
                size="sm"
                bg={inputBg}
                borderColor={inputBorder}
                borderRightRadius={0}
                _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                fontSize="sm"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNewsletterSubmit();
                }}
              />
              <Button
                colorScheme="brand"
                size="sm"
                borderLeftRadius={0}
                px={4}
                fontWeight="700"
                isLoading={newsletterLoading}
                onClick={handleNewsletterSubmit}
              >
                Đăng Ký
              </Button>
            </HStack>
          </Box>
        </Flex>

        <Divider borderColor={divider} mb={7} />

        {}
        <Flex
          align="center"
          gap={3}
          bg={shippingBg}
          border="1px solid"
          borderColor={divider}
          borderRadius="lg"
          px={5}
          py={3}
          mb={7}
        >
          <Icon as={MdOutlineLocalShipping} boxSize={5} color={shippingColor} flexShrink={0} />
          <Text fontSize="sm" fontWeight="600" color={shippingColor}>
            Miễn phí giao hàng cho đơn hàng từ 500.000 ₫ trở lên.
          </Text>
        </Flex>

        {}
        <Box mb={6}>
          <Text fontSize="xs" fontWeight="700" color={mutedColor} mb={2} letterSpacing="wide">
            ĐIỀU KHOẢN SỬ DỤNG
          </Text>
          <Text fontSize="sm" color={textColor} lineHeight="1.9">
            <b>CÔNG TY TNHH TRENDIFY VIỆT NAM</b>
            <br />
            Địa chỉ trụ sở chính: TP. Hồ Chí Minh, Việt Nam.
            <br />
            [Trung Tâm Khách Hàng] Số Điện Thoại:{' '}
            <Link href="tel:02800000000" color="brand.500" fontWeight="600">
              028 0000 0000
            </Link>
            &nbsp;|&nbsp;
            <Link href="mailto:trendify.store.vn@gmail.com" color="brand.500" fontWeight="600">
              trendify.store.vn@gmail.com
            </Link>
          </Text>
        </Box>

        <Text
          fontSize="xs"
          color={mutedColor}
          mb={8}
          cursor="pointer"
          _hover={{ color: 'brand.500' }}
        >
          Cài Đặt Cookie
        </Text>

        <Divider borderColor={divider} mb={6} />

        {}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          gap={4}
        >
          <Text fontSize="xs" color={copyColor}>
            Bản quyền thuộc Công ty TNHH Trendify Việt Nam. Bảo lưu mọi quyền. &copy; {new Date().getFullYear()}
          </Text>

          {}
          <HStack spacing={4}>
            <Link href="https://facebook.com" isExternal _hover={{ color: iconHover }}>
              <Icon as={MdFacebook} boxSize={6} color={textColor} transition="color 0.15s" />
            </Link>
            <Link href="https://instagram.com" isExternal _hover={{ color: iconHover }}>
              <Icon as={FaInstagram} boxSize={5} color={textColor} transition="color 0.15s" />
            </Link>
            <Link href="https://youtube.com" isExternal _hover={{ color: iconHover }}>
              <Icon as={FaYoutube} boxSize={5} color={textColor} transition="color 0.15s" />
            </Link>
            <Link href="https://tiktok.com" isExternal _hover={{ color: iconHover }}>
              <Icon as={FaTiktok} boxSize={4} color={textColor} transition="color 0.15s" />
            </Link>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}
