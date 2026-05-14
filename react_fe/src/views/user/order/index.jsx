import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Spinner,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'contexts/UserContext';
import { useCart } from 'contexts/CartContext';
import Form from 'views/user/order/components/Form';
import Summary from 'views/user/order/components/Summary';

export default function OrderPage() {
  const { user } = useUser();
  const { cart, loading } = useCart();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const breadcrumbColor = useColorModeValue('gray.500', 'gray.400');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressStreet: '',
    addressWard: '',
    addressDistrict: '',
    addressCity: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        addressStreet: user.addressStreet || '',
        addressWard: user.addressWard || '',
        addressDistrict: user.addressDistrict || '',
        addressCity: user.addressCity || '',
      });
    }
  }, [user]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box bg={bgColor} p={{ base: 4, md: 8, lg: 20 }}>
      <Flex direction="column">
        <Breadcrumb fontWeight="medium" fontSize="sm" mb={8} separator={'/'}>
          <BreadcrumbItem>
            <BreadcrumbLink
              color={breadcrumbColor}
              onClick={() => navigate('/')}
              _hover={{ color: brandColor }}
            >
              Trang Chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color={textColor}>Thanh Toán</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
          {/* Form rộng hơn */}
          <Box flex={1}>
            <Form formData={formData} setFormData={setFormData} />
          </Box>

          {/* Summary hẹp hơn */}
          <Box flex={1}>
            <Summary cart={cart} formData={formData} />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
