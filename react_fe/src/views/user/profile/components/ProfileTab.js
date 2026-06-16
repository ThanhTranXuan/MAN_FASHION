import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  useColorModeValue,
  Avatar,
  Flex,
  Icon,
  Text,
  Divider,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import { useUser } from 'contexts/UserContext';
import { MdCameraAlt } from 'react-icons/md';
import ProfileService from 'services/ProfileService';

export default function ProfileTab({ user }) {
  const toast = useAppToast();
  const { refreshUser } = useUser();
  const bgColor = useColorModeValue('fashion.softSurface', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const sectionBg = useColorModeValue('fashion.pageBg', 'navy.700');
  const borderColor = useColorModeValue('fashion.stone', 'gray.700');

  const [formData, setFormData] = useState({
    avatarUrl: '',
    fullName: '',
    email: '',
    phone: '',
    addressStreet: '',
    addressWard: '',
    addressDistrict: '',
    addressCity: '',
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      // ✅ Parse combined address string into 4 fields
      let addressStreet = '';
      let addressWard = '';
      let addressDistrict = '';
      let addressCity = '';
      
      if (user.address) {
        const parts = user.address.split(', ');
        addressStreet = parts[0] || '';
        addressWard = parts[1] || '';
        addressDistrict = parts[2] || '';
        addressCity = parts[3] || '';
      }
      
      setFormData({
        avatarUrl: user.avatarUrl || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        addressStreet,
        addressWard,
        addressDistrict,
        addressCity,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // ✅ Combine 4 address fields into 1 string
      const addressParts = [
        formData.addressStreet,
        formData.addressWard,
        formData.addressDistrict,
        formData.addressCity
      ].filter(Boolean);
      
      const combinedAddress = addressParts.join(', ');
      
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: combinedAddress
      };
      
      await ProfileService.updateProfile(updateData);
      toast.success('Cập nhật hồ sơ thành công');
      
      // ✅ Refresh user context to reload updated data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
      toast.error('Cập nhật thất bại');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { avatarUrl } = await ProfileService.updateAvatar(file);
      setFormData((prev) => ({ ...prev, avatarUrl }));

      toast.success('Cập nhật ảnh đại diện thành công');
    } catch (err) {
      toast.error('Cập nhật ảnh đại diện thất bại');
    }
  };

  const isGoogleAvatar = formData.avatarUrl?.includes('googleusercontent.com');

  const handleAvatarClick = () => {
    if (!isGoogleAvatar && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box
      bg={bgColor}
      p={{ base: 0, md: 8 }}
      borderRadius="16px"
      shadow="md"
      border="1px solid"
      borderColor={borderColor}
      w="100%"
    >
      {/* Avatar + Basic Info */}
      <Flex direction="column" align="center" justify="center" mb={8}>
        <Box position="relative" w="140px" h="140px">
          <Avatar
            _hover={{ cursor: isGoogleAvatar ? 'default' : 'pointer' }}
            src={formData.avatarUrl}
            size="2xl"
            w="140px"
            h="140px"
            border="4px solid"
            borderColor={borderColor}
          />
          {!isGoogleAvatar && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              w="100%"
              h="100%"
              align="center"
              justify="center"
              bg="blackAlpha.500"
              opacity="0"
              _hover={{ opacity: 1, cursor: 'pointer' }}
              borderRadius="full"
              onClick={handleAvatarClick}
            >
              <Icon as={MdCameraAlt} w="40px" h="40px" color="white" />
            </Flex>
          )}
        </Box>
        {!isGoogleAvatar && (
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            display="none"
          />
        )}
        <Text mt={4} fontSize="xl" fontWeight="bold" color={textColor}>
          {formData.fullName || 'Người Dùng'}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {formData.email}
        </Text>
      </Flex>

      <Divider my={6} borderColor={borderColor} />

      {/* Personal Information */}
      <Box p={4} bg={sectionBg} borderRadius="12px" mb={6} border="1px solid" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Thông Tin Cá Nhân
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel>Họ Tên</FormLabel>
            <Input
              color={textColor}
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              color={textColor}
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
            />
          </FormControl>

          <FormControl>
            <FormLabel>Số Điện Thoại</FormLabel>
            <Input
              color={textColor}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </FormControl>
        </SimpleGrid>
      </Box>

      {/* Address Information */}
      <Box p={4} bg={sectionBg} borderRadius="12px" border="1px solid" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Địa Chỉ
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel>Số Nhà / Tên Đường</FormLabel>
            <Input
              color={textColor}
              name="addressStreet"
              value={formData.addressStreet}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Phường / Xã</FormLabel>
            <Input
              color={textColor}
              name="addressWard"
              value={formData.addressWard}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Quận / Huyện</FormLabel>
            <Input
              color={textColor}
              name="addressDistrict"
              value={formData.addressDistrict}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Tỉnh / Thành Phố</FormLabel>
            <Input
              color={textColor}
              name="addressCity"
              value={formData.addressCity}
              onChange={handleChange}
            />
          </FormControl>
        </SimpleGrid>
      </Box>

      <Button mt={8} colorScheme="brand" color="white" onClick={handleSubmit}>
        Lưu Thay Đổi
      </Button>
    </Box>
  );
}
