import React, { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  DrawerFooter,
  VStack,
  Text,
  Button,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  CheckboxGroup,
  Checkbox,
  useColorModeValue,
  Flex,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { MdArrowBack, MdChevronRight } from 'react-icons/md';

export default function FiltersDrawer({
  isOpen,
  onClose,
  values,
  onApply,
  categorySlug,
  categories,
  onChangeCategory,
}) {
  const [local, setLocal] = useState(values);
  const [currentParent, setCurrentParent] = useState(null);
  const [currentSubParent, setCurrentSubParent] = useState(null);

  // 🎨 Theme
  const bgColor = useColorModeValue('white', 'navy.800');
  const labelColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const brandColor = useColorModeValue('brand.500', 'brand.300');
  const tagBg = useColorModeValue('gray.50', 'gray.800');
  const footerBg = useColorModeValue('gray.50', 'navy.900');

  useEffect(() => setLocal(values), [values]);

  // 🧭 Category helpers
  const getChildren = (parentId) =>
    categories.filter((c) => c.parentId === parentId);
  const parents = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );
  const findCategoryName = (id) => categories.find((c) => c.id === id)?.name;

  // 🎨 Filter options
  const colors = [
    'black',
    'white',
    'red',
    'blue',
    'green',
    'beige',
    'brown',
    'gray',
    'pink',
    'yellow',
  ];

  const sizeNumbers = ['28', '29', '30', '31', '32', '33', '34', '35'];
  const sizeLetters = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay bg="rgba(0,0,0,0.35)" backdropFilter="blur(6px)" />
      <DrawerContent
        borderLeftRadius="xl"
        display="flex"
        flexDirection="column"
        bg={bgColor}
        color={labelColor}
      >
        <DrawerCloseButton />
        <DrawerHeader borderBottom="1px solid" borderColor={borderColor}>
          Filters
        </DrawerHeader>

        {/* === BODY === */}
        <DrawerBody overflowY="auto" pb={4}>
          <VStack align="stretch" spacing={6}>
            <Accordion allowMultiple border="none">
              {/* ✅ Category */}
              <AccordionItem border="none" mb={4}>
                <AccordionButton
                  _hover={{ bg: 'transparent' }}
                  px={0}
                  py={2}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                >
                  <Box flex="1" textAlign="left">
                    Category
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel px={0} pt={3}>
                  <VStack align="stretch" spacing={2}>
                    {/* Level 1 */}
                    {currentParent === null &&
                      parents.map((p) => (
                        <Flex
                          key={p.id}
                          justify="space-between"
                          align="center"
                          py={2}
                          px={2}
                          borderRadius="md"
                          cursor="pointer"
                          onClick={() =>
                            getChildren(p.id).length > 0
                              ? setCurrentParent(p.id)
                              : onChangeCategory?.(p.slug)
                          }
                        >
                          <Text
                            fontWeight={
                              categorySlug === p.slug ? 'bold' : 'normal'
                            }
                            color={
                              categorySlug === p.slug ? brandColor : labelColor
                            }
                          >
                            {p.name}
                          </Text>
                          {getChildren(p.id).length > 0 && (
                            <MdChevronRight
                              fontSize="xs"
                              color={subTextColor}
                            />
                          )}
                        </Flex>
                      ))}

                    {/* Level 2 */}
                    {currentParent !== null && currentSubParent === null && (
                      <>
                        <Flex
                          align="center"
                          position="relative"
                          py={2}
                          borderBottom="1px solid"
                          borderColor={borderColor}
                          cursor="pointer"
                          onClick={() => setCurrentParent(null)}
                        >
                          <Box position="absolute" left={0}>
                            <MdArrowBack />
                          </Box>
                          <Text
                            fontWeight="bold"
                            textAlign="center"
                            w="100%"
                            textTransform="uppercase"
                          >
                            {findCategoryName(currentParent)}
                          </Text>
                        </Flex>

                        {getChildren(currentParent).map((c2) => (
                          <Flex
                            key={c2.id}
                            justify="space-between"
                            align="center"
                            py={2}
                            px={2}
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() =>
                              getChildren(c2.id).length > 0
                                ? setCurrentSubParent(c2.id)
                                : onChangeCategory?.(c2.slug)
                            }
                          >
                            <Text
                              fontWeight={
                                categorySlug === c2.slug ? 'bold' : 'normal'
                              }
                              color={
                                categorySlug === c2.slug
                                  ? brandColor
                                  : labelColor
                              }
                            >
                              {c2.name}
                            </Text>
                            {getChildren(c2.id).length > 0 && (
                              <MdChevronRight
                                fontSize="xs"
                                color={subTextColor}
                              />
                            )}
                          </Flex>
                        ))}
                      </>
                    )}

                    {/* Level 3 */}
                    {currentSubParent !== null && (
                      <>
                        <Flex
                          align="center"
                          gap={2}
                          cursor="pointer"
                          py={2}
                          mb={2}
                          borderBottom="1px solid"
                          borderColor={borderColor}
                          onClick={() => setCurrentSubParent(null)}
                        >
                          <MdArrowBack />
                          <Text
                            fontWeight="bold"
                            textTransform="uppercase"
                            flex="1"
                          >
                            {findCategoryName(currentSubParent)}
                          </Text>
                        </Flex>

                        <Text
                          fontWeight="semibold"
                          color={brandColor}
                          cursor="pointer"
                          mb={1}
                          onClick={() =>
                            onChangeCategory?.(
                              getChildren(currentParent).find(
                                (c) => c.id === currentSubParent,
                              )?.slug,
                            )
                          }
                        >
                          All
                        </Text>

                        {getChildren(currentSubParent).map((c3) => (
                          <Text
                            key={c3.id}
                            fontSize="sm"
                            cursor="pointer"
                            py={1}
                            px={2}
                            borderRadius="md"
                            _hover={{ color: brandColor }}
                            onClick={() => onChangeCategory?.(c3.slug)}
                          >
                            {c3.name}
                          </Text>
                        ))}
                      </>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 🎨 Color */}
              <AccordionItem border="none" mb={4}>
                <AccordionButton
                  _hover={{ bg: 'transparent' }}
                  px={0}
                  py={2}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                >
                  <Box flex="1" textAlign="left">
                    Color
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel px={0} pt={3}>
                  <Flex wrap="wrap" gap={2}>
                    {colors.map((c) => {
                      const selected = local.color === c;
                      return (
                        <Tag
                          key={c}
                          size="md"
                          borderRadius="full"
                          cursor="pointer"
                          variant={selected ? 'solid' : 'subtle'}
                          colorScheme={selected ? 'brand' : undefined}
                          bg={selected ? brandColor : tagBg}
                          color={selected ? 'white' : labelColor}
                          onClick={() =>
                            setLocal((prev) => ({
                              ...prev,
                              color: selected ? '' : c,
                            }))
                          }
                        >
                          <Box
                            w="14px"
                            h="14px"
                            borderRadius="full"
                            bg={c}
                            border="1px solid #ccc"
                            mr={2}
                          />
                          <TagLabel textTransform="capitalize">{c}</TagLabel>
                        </Tag>
                      );
                    })}
                  </Flex>
                </AccordionPanel>
              </AccordionItem>

              {/* 📏 Size — last accordion (no border) */}
              <AccordionItem border="none">
                <AccordionButton
                  _hover={{ bg: 'transparent' }}
                  px={0}
                  py={2}
                  // ❌ No border bottom here
                >
                  <Box flex="1" textAlign="left">
                    Size
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel px={0} pt={3}>
                  <VStack align="stretch" spacing={4}>
                    <Text
                      fontWeight="semibold"
                      fontSize="sm"
                      color={subTextColor}
                    >
                      Numeric
                    </Text>
                    <CheckboxGroup
                      colorScheme="brand"
                      value={local.size || []}
                      onChange={(val) => setLocal((p) => ({ ...p, size: val }))}
                    >
                      <Flex wrap="wrap" gap={2}>
                        {sizeNumbers.map((s) => (
                          <Checkbox key={s} value={s}>
                            {s}
                          </Checkbox>
                        ))}
                      </Flex>
                    </CheckboxGroup>

                    <Text
                      fontWeight="semibold"
                      fontSize="sm"
                      color={subTextColor}
                    >
                      Alpha
                    </Text>
                    <CheckboxGroup
                      colorScheme="brand"
                      value={local.size || []}
                      onChange={(val) => setLocal((p) => ({ ...p, size: val }))}
                    >
                      <Flex wrap="wrap" gap={2}>
                        {sizeLetters.map((s) => (
                          <Checkbox key={s} value={s}>
                            {s}
                          </Checkbox>
                        ))}
                      </Flex>
                    </CheckboxGroup>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </DrawerBody>

        {/* === FOOTER === */}
        <DrawerFooter
          borderTop="1px solid"
          borderColor={borderColor}
          py={3}
          gap={3}
          bg={footerBg}
        >
          <Button
            variant="outline"
            borderColor={borderColor}
            color={labelColor}
            onClick={() => setLocal(values)}
          >
            Reset
          </Button>
          <Button
            colorScheme="brand"
            w="100%"
            onClick={() => {
              onApply(local);
              onClose();
            }}
          >
            Apply
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
