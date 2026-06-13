import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';

import EmployeeService from 'services/EmployeeService';
import { MdArrowDropDown } from 'react-icons/md';
import { formatCurrencyVND } from 'utils/FormatHelper';

export default function Detail({ isOpen, onClose, employee }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [attendances, setAttendances] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [salary, setSalary] = useState(0);

  const toast = useAppToast();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const headerBg = useColorModeValue('gray.100', 'navy.800');
  const rowBg = useColorModeValue('yellow.100', 'yellow.900');

  const fetchData = useCallback(async () => {
    if (!employee) return;
    try {
      const { data } = await EmployeeService.getById(employee.id, {
        month,
        year,
      });
      setAttendances(data.attendances || []);
      setTotalHours(data.totalHours || 0);
      setSalary(data.totalSalary || 0);
    } catch (err) {
      toast.error('Error loading data');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, month, year]);

  useEffect(() => {
    if (employee) {
      fetchData();
    }
  }, [employee, month, year, fetchData]);

  // Removed local usdFormatter

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="20px" bg={bgColor} color={textColor}>
        <ModalHeader bg={headerBg} borderTopRadius="20px">
          Chi Tiết Nhân Viên - {employee?.fullName}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justify="space-between" align="center" mb={4} px={2}>
            <HStack spacing={4}>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<MdArrowDropDown />}
                  variant="outline"
                >
                  Tháng {month}
                </MenuButton>
                <MenuList>
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} onClick={() => setMonth(i + 1)}>
                      Tháng {i + 1}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>

              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<MdArrowDropDown />}
                  variant="outline"
                >
                  Năm {year}
                </MenuButton>
                <MenuList>
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <MenuItem key={y} onClick={() => setYear(y)}>
                        Năm {y}
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </Menu>
            </HStack>

            <HStack spacing={6}>
              <Text fontWeight="bold">
                Tổng Giờ Làm: {totalHours.toFixed(2)} giờ
              </Text>
              <Text fontWeight="bold">
                Tổng Lương: {formatCurrencyVND(salary || 0)}
              </Text>
            </HStack>
          </Flex>

          <Table size="sm" variant="simple">
            <Thead bg={headerBg}>
              <Tr>
                <Th>Giờ Vào</Th>
                <Th>Giờ Ra</Th>
                <Th>Số Giờ</Th>
                <Th>Lương</Th>
              </Tr>
            </Thead>
            <Tbody>
              {attendances.map((r, idx) => (
                <Tr key={idx} bg={idx % 2 === 0 ? 'transparent' : rowBg}>
                  <Td>{new Date(r.checkInTime).toLocaleString()}</Td>
                  <Td>
                    {r.checkOutTime
                      ? new Date(r.checkOutTime).toLocaleString()
                      : '-'}
                  </Td>
                  <Td>{r.workingHours?.toFixed(2) || 0}</Td>
                  <Td>{formatCurrencyVND(r.salary || 0)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>

        <ModalFooter bg={headerBg} borderBottomRadius="20px">
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
