import React from 'react';
import {
  Badge,
  Box,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';

export default function Form({
  formData,
  setFormData,
  addressMode,
  hasProfileAddress,
  profileAddress,
  isAuthenticated,
  onAddressModeChange,
}) {
  const sectionBg = useColorModeValue('gray.50', 'navy.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const selectedBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const formDisabled = addressMode === 'profile';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  return (
    <Box flex="1" bg={sectionBg} p={6} borderRadius="16px" boxShadow="lg">
      <Heading size="md" mb={6} color={textColor}>
        Thông Tin Giao Hàng
      </Heading>

      {isAuthenticated && (
        <Box mb={6}>
          <Text fontWeight="semibold" mb={3} color={textColor}>
            Địa chỉ giao hàng
          </Text>

          <RadioGroup value={addressMode} onChange={onAddressModeChange} mb={3}>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
              <Radio value="profile" isDisabled={!hasProfileAddress}>
                Dùng địa chỉ trong hồ sơ
              </Radio>
              <Radio value="new">Nhập địa chỉ mới</Radio>
            </Stack>
          </RadioGroup>

          {!hasProfileAddress && (
            <Text fontSize="sm" color="gray.500">
              Hồ sơ của bạn chưa có địa chỉ. Vui lòng nhập địa chỉ giao hàng
              mới.
            </Text>
          )}

          {addressMode === 'profile' && hasProfileAddress && (
            <Box
              p={3}
              border="1px solid"
              borderColor="brand.500"
              bg={selectedBg}
              borderRadius="12px"
            >
              <Text fontSize="sm" fontWeight="bold">
                {formData.fullName || ''} · {formData.phone || ''}
              </Text>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {profileAddress}
              </Text>
              <Badge colorScheme="green" mt={2}>
                Địa chỉ hồ sơ
              </Badge>
            </Box>
          )}
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Họ Tên</FormLabel>
            <Input
              color={textColor}
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              isDisabled={formDisabled}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              color={textColor}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isDisabled={formDisabled}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Số Điện Thoại</FormLabel>
            <Input
              color={textColor}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              isDisabled={formDisabled}
            />
          </FormControl>
        </VStack>

        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Số Nhà / Tên Đường</FormLabel>
            <Input
              color={textColor}
              name="addressStreet"
              value={formData.addressStreet}
              onChange={handleChange}
              isDisabled={formDisabled}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Phường / Xã</FormLabel>
            <Input
              color={textColor}
              name="addressWard"
              value={formData.addressWard}
              onChange={handleChange}
              isDisabled={formDisabled}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Quận / Huyện</FormLabel>
            <Input
              color={textColor}
              name="addressDistrict"
              value={formData.addressDistrict}
              onChange={handleChange}
              isDisabled={formDisabled}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Tỉnh / Thành Phố</FormLabel>
            <Input
              color={textColor}
              name="addressCity"
              value={formData.addressCity}
              onChange={handleChange}
              isDisabled={formDisabled}
            />
          </FormControl>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}
