import React, { useEffect, useState, useCallback } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import EmployeeService from 'services/EmployeeService';

const InfoItem = ({ label, value }) => (
  <Box>
    <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase">
      {label}
    </Text>
    <Text fontSize="sm" fontWeight="600" mt={1} wordBreak="break-word">
      {value || 'Chưa cập nhật'}
    </Text>
  </Box>
);

export default function Detail({ isOpen, onClose, employee }) {
  const [detail, setDetail] = useState(null);
  const toast = useAppToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const headerBg = useColorModeValue('gray.100', 'navy.800');

  const fetchData = useCallback(async () => {
    if (!employee) return;
    try {
      const { data } = await EmployeeService.getById(employee.id);
      setDetail(data);
    } catch (err) {
      toast.error('Không thể tải thông tin nhân viên');
    }
  }, [employee, toast]);

  useEffect(() => {
    if (isOpen && employee) fetchData();
  }, [isOpen, employee, fetchData]);

  const current = detail || employee || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="16px" bg={bgColor} color={textColor}>
        <ModalHeader bg={headerBg} borderTopRadius="16px">
          Chi tiết nhân viên - {current.fullName || ''}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6}>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
            <GridItem>
              <InfoItem label="Họ tên" value={current.fullName} />
            </GridItem>
            <GridItem>
              <InfoItem label="Email" value={current.email} />
            </GridItem>
            <GridItem>
              <InfoItem label="Số điện thoại" value={current.phone} />
            </GridItem>
            <GridItem>
              <InfoItem label="Vai trò" value={current.roleName || 'EMPLOYEE'} />
            </GridItem>
            <GridItem>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase">
                Trạng thái
              </Text>
              <Badge mt={1} colorScheme={current.isActive === false ? 'red' : 'green'}>
                {current.isActive === false ? 'Đã khóa' : 'Đang hoạt động'}
              </Badge>
            </GridItem>
            <GridItem>
              <InfoItem
                label="Ngày tạo"
                value={current.createdAt ? new Date(current.createdAt).toLocaleString('vi-VN') : null}
              />
            </GridItem>
          </Grid>

          <Divider my={5} />
          <InfoItem label="Địa chỉ" value={current.address} />
        </ModalBody>

        <ModalFooter bg={headerBg} borderBottomRadius="16px">
          <Button onClick={onClose}>Đóng</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
