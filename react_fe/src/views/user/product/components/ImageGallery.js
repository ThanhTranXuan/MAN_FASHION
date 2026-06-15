import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Box,
  Image,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

export default function ImageGallery({
  images = [],
  fallback,
  activeImage,
  onImageChange,
}) {
  // ===== Data =====
  const items = useMemo(
    () => (images?.length ? images : fallback ? [{ url: fallback }] : []),
    [images, fallback]
  );

  const initialIndex = useMemo(() => {
    if (!activeImage) return 0;
    const idx = items.findIndex((img) => img.url === activeImage);
    return idx >= 0 ? idx : 0;
  }, [items, activeImage]);

  const [active, setActive] = useState(initialIndex);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const listRef = useRef(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    setActive(initialIndex);
  }, [initialIndex]);

  // ===== Auto-scroll thumbnail list =====
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const activeThumb = container.children[active];
    if (!activeThumb) return;

    const containerSize = isMobile
      ? container.clientWidth
      : container.clientHeight;
    const thumbSize = isMobile
      ? activeThumb.clientWidth
      : activeThumb.clientHeight;
    const offset = isMobile ? activeThumb.offsetLeft : activeThumb.offsetTop;

    const targetScroll = offset - containerSize / 2 + thumbSize / 2;
    container.scrollTo({
      [isMobile ? 'left' : 'top']: Math.max(0, targetScroll),
      behavior: 'smooth',
    });
  }, [active, isMobile]);

  // ===== Prev / Next =====
  const handlePrev = () => {
    if (items.length <= 1) return;
    const newIdx = active === 0 ? items.length - 1 : active - 1;
    setActive(newIdx);
    onImageChange?.(items[newIdx].url);
  };

  const handleNext = () => {
    if (items.length <= 1) return;
    const newIdx = active === items.length - 1 ? 0 : active + 1;
    setActive(newIdx);
    onImageChange?.(items[newIdx].url);
  };

  const openPreview = () => {
    if (items[active]) setIsPreviewOpen(true);
  };

  // ===== Thumbnail size config =====
  const thumbWidth = 88;
  const thumbHeight = 110;

  // ===== Thumbnail List (responsive) =====
  const ThumbList = (
    <Box
      ref={listRef}
      display="flex"
      flexDirection={isMobile ? 'row' : 'column'}
      alignItems="center"
      justifyContent="start"
      spacing={2}
      overflowX={isMobile ? 'auto' : 'hidden'}
      overflowY={isMobile ? 'hidden' : 'auto'}
      maxH={!isMobile ? '560px' : 'auto'}
      maxW={isMobile ? '100%' : `${thumbWidth + 16}px`}
      py={isMobile ? 2 : 0}
      pr={isMobile ? 0 : 1}
      gap="8px"
      sx={{
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      {items.map((img, idx) => (
        <Box
          key={idx}
          borderWidth="2px"
          borderColor={active === idx ? 'brand.400' : 'transparent'}
          borderRadius="md"
          overflow="hidden"
          cursor="pointer"
          flexShrink={0}
          onClick={() => {
            setActive(idx);
            onImageChange?.(img.url);
          }}
          boxSizing="border-box"
          w={`${thumbWidth}px`}
          h={`${thumbHeight}px`}
          transition="border-color 0.2s ease"
        >
          <Image
            src={img.url}
            alt={`thumb-${idx}`}
            w="100%"
            h="100%"
            objectFit="cover"
            draggable={false}
            display="block"
          />
        </Box>
      ))}
    </Box>
  );

  // ===== Layout =====
  return (
    <Box
      display="flex"
      flexDirection={isMobile ? 'column' : 'row'}
      gap={4}
      align="start"
      w="full"
    >
      {/* Thumbnail left (desktop only) */}
      {!isMobile && ThumbList}

      {/* Main image */}
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        position="relative"
        aspectRatio="3 / 4"
        bg="fashion.pageBg"
        flex="1"
        cursor={items[active] ? 'zoom-in' : 'default'}
        onClick={openPreview}
      >
        {items[active] && (
          <Image
            src={items[active].url}
            alt={`image-${active}`}
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            objectFit="contain"
          />
        )}

        {/* Nav buttons */}
        {items.length > 1 && (
          <>
            <IconButton
              aria-label="Previous image"
              icon={<ChevronLeftIcon boxSize={6} />}
              position="absolute"
              top="50%"
              left="4"
              transform="translateY(-50%)"
              borderRadius="full"
              bg="rgba(0,0,0,0.4)"
              color="white"
              _hover={{ bg: 'rgba(0,0,0,0.6)' }}
              onClick={(event) => {
                event.stopPropagation();
                handlePrev();
              }}
            />
            <IconButton
              aria-label="Next image"
              icon={<ChevronRightIcon boxSize={6} />}
              position="absolute"
              top="50%"
              right="4"
              transform="translateY(-50%)"
              borderRadius="full"
              bg="rgba(0,0,0,0.4)"
              color="white"
              _hover={{ bg: 'rgba(0,0,0,0.6)' }}
              onClick={(event) => {
                event.stopPropagation();
                handleNext();
              }}
            />
          </>
        )}
      </Box>

      {/* Thumbnail bottom (mobile only) */}
      {isMobile && (
        <HStack
          justify="center"
          align="center"
          w="full"
          overflowX="auto"
          spacing={2}
          mt={3}
          sx={{
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {ThumbList}
        </HStack>
      )}

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        size="full"
        isCentered
        motionPreset="scale"
      >
        <ModalOverlay bg="rgba(0,0,0,0.88)" />
        <ModalContent bg="transparent" boxShadow="none" m={0}>
          <ModalCloseButton
            aria-label="Đóng ảnh"
            color="white"
            bg="rgba(255,255,255,0.16)"
            borderRadius="full"
            top={{ base: 4, md: 6 }}
            right={{ base: 4, md: 6 }}
            _hover={{ bg: 'rgba(255,255,255,0.28)' }}
          />
          <ModalBody
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={{ base: 3, md: 12 }}
            py={{ base: 14, md: 10 }}
          >
            {items[active] && (
              <Image
                src={items[active].url}
                alt={`Ảnh sản phẩm ${active + 1}`}
                maxW="100%"
                maxH={{ base: '82vh', md: '90vh' }}
                objectFit="contain"
                draggable={false}
              />
            )}

            {items.length > 1 && (
              <>
                <IconButton
                  aria-label="Ảnh trước"
                  icon={<ChevronLeftIcon boxSize={8} />}
                  position="fixed"
                  top="50%"
                  left={{ base: 3, md: 8 }}
                  transform="translateY(-50%)"
                  borderRadius="full"
                  bg="rgba(255,255,255,0.18)"
                  color="white"
                  size={{ base: 'md', md: 'lg' }}
                  _hover={{ bg: 'rgba(255,255,255,0.3)' }}
                  onClick={handlePrev}
                />
                <IconButton
                  aria-label="Ảnh tiếp theo"
                  icon={<ChevronRightIcon boxSize={8} />}
                  position="fixed"
                  top="50%"
                  right={{ base: 3, md: 8 }}
                  transform="translateY(-50%)"
                  borderRadius="full"
                  bg="rgba(255,255,255,0.18)"
                  color="white"
                  size={{ base: 'md', md: 'lg' }}
                  _hover={{ bg: 'rgba(255,255,255,0.3)' }}
                  onClick={handleNext}
                />
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
