import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  Box,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { formatUSD } from 'utils/FormatHelper';
import ProductService from 'services/ProductService';

export default function Detail({ isOpen, onClose, order }) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const [loading, setLoading] = useState(false);
  const [detailedItems, setDetailedItems] = useState([]);

  useEffect(() => {
    if (!order?.items?.length) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          order.items.map(async (item) => {
            try {
              const res = await ProductService.getDetailById(item.productId);
              const product = res.data.data;
              const variant = product.variants?.find(
                (v) => v.id === item.variantId || v._id === item.variantId,
              );
              return {
                ...item,
                productName: product.name,
                color: variant?.color || '-',
                size: variant?.size || '-',
              };
            } catch (err) {
              console.error(
                'Failed to fetch product detail for',
                item.productId,
              );
              return {
                ...item,
                productName: '(Unknown product)',
                color: '-',
                size: '-',
              };
            }
          }),
        );
        setDetailedItems(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [order]);

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontWeight="bold">
          Order Detail - {order.orderCode}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* 🧾 Customer info */}
          <Box mb={3}>
            <Text fontWeight="600" color={textColor}>
              Customer: {order.fullName}
            </Text>
            <Text>Email: {order.email}</Text>
            <Text>Phone: {order.phone}</Text>
            <Text>Address: {order.address}</Text>
          </Box>

          {/* 🧠 Loading state */}
          {loading ? (
            <Flex justify="center" align="center" minH="150px">
              <Spinner size="lg" color="brand.500" />
            </Flex>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th borderColor={borderColor}>#</Th>
                  <Th borderColor={borderColor}>Product</Th>
                  <Th borderColor={borderColor}>Color</Th>
                  <Th borderColor={borderColor}>Size</Th>
                  <Th borderColor={borderColor}>Qty</Th>
                  <Th borderColor={borderColor}>Price</Th>
                </Tr>
              </Thead>
              <Tbody>
                {detailedItems.map((item, idx) => (
                  <Tr key={item.id}>
                    <Td borderColor={borderColor}>{idx + 1}</Td>
                    <Td borderColor={borderColor}>
                      <Text fontWeight="600" noOfLines={2}>
                        {item.productName}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor} textTransform="capitalize">
                      {item.color}
                    </Td>
                    <Td borderColor={borderColor}>{item.size}</Td>
                    <Td borderColor={borderColor}>{item.quantity}</Td>
                    <Td borderColor={borderColor} color="brand.500">
                      {formatUSD(item.price)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
