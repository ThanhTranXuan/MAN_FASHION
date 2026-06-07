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

const emptyFormData = {
  fullName: '',
  email: '',
  phone: '',
  addressStreet: '',
  addressWard: '',
  addressDistrict: '',
  addressCity: '',
};

const mapProfileToForm = (user) => ({
  ...emptyFormData,
  fullName: user?.fullName || '',
  email: user?.email || '',
  phone: user?.phone || '',
  addressStreet: user?.addressStreet || '',
  addressWard: user?.addressWard || '',
  addressDistrict: user?.addressDistrict || '',
  addressCity: user?.addressCity || '',
});

export default function OrderPage() {
  const { user } = useUser();
  const { cart, loading } = useCart();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const breadcrumbColor = useColorModeValue('gray.500', 'gray.400');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  const [formData, setFormData] = useState(emptyFormData);
  const [addressMode, setAddressMode] = useState('new');

  const hasProfileAddress = Boolean(user?.address?.trim());

  useEffect(() => {
    if (!user) {
      setAddressMode('new');
      setFormData(emptyFormData);
      return;
    }

    if (user.address?.trim()) {
      setAddressMode('profile');
      setFormData(mapProfileToForm(user));
    } else {
      setAddressMode('new');
      setFormData(emptyFormData);
    }
  }, [user]);

  const handleAddressModeChange = (mode) => {
    setAddressMode(mode);
    setFormData(
      mode === 'profile'
        ? mapProfileToForm(user)
        : emptyFormData,
    );
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box bg={bgColor} px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
      <Flex direction="column" maxW="1440px" mx="auto">
        <Breadcrumb fontWeight="medium" fontSize="sm" mb={8} separator="/">
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

        <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 6, lg: 8 }}>
          <Box flex={1}>
            <Form
              formData={formData}
              setFormData={setFormData}
              addressMode={addressMode}
              hasProfileAddress={hasProfileAddress}
              profileAddress={user?.address || ''}
              isAuthenticated={Boolean(user)}
              onAddressModeChange={handleAddressModeChange}
            />
          </Box>

          <Box flex={1}>
            <Summary
              cart={cart}
              formData={formData}
              addressMode={addressMode}
              hasProfileAddress={hasProfileAddress}
              profileAddress={user?.address || ''}
            />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
