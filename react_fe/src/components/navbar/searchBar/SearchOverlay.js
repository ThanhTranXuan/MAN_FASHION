import React, { useState, useRef } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Input,
  Text,
  useColorModeValue,
  CloseButton,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { MdSearch, MdMic, MdMicOff, MdHistory } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAppToast } from 'utils/ToastHelper';
import { AnimatePresence, motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();
  const toast = useAppToast();
  const recognitionRef = useRef(null);

  const bg = useColorModeValue('white', 'navy.900');
  const overlayBg = useColorModeValue('rgba(255,255,255,0.95)', 'rgba(11,20,55,0.95)');

  // Lịch sử tìm kiếm mẫu
  const searchHistory = ['Áo thun polo', 'Quần tây công sở', 'Giày sneaker nam'];
  const popularSearches = ['Áo khoác', 'Áo sơ mi tay dài', 'Phụ kiện thời trang', 'Áo len'];

  const handleSearch = (q) => {
    const term = q || query;
    if (!term.trim()) return;
    navigate(`/user/product?q=${encodeURIComponent(term)}`);
    onClose();
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Trình duyệt không hỗ trợ tìm kiếm bằng giọng nói.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Reset query trước khi nghe mới
    setQuery('');

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript.trim();
      if (text) {
        setQuery(text);
        // TRUYỀN TRỰC TIẾP text vào handleSearch, không đợi state
        handleSearch(text);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Lỗi khi bắt đầu mic:', e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionBox
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg={overlayBg}
          zIndex={2000}
          backdropFilter="blur(10px)"
          display="flex"
          justifyContent="center"
          alignItems="flex-start"
          pt={{ base: '10vh', md: '15vh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
      <MotionBox
        w={{ base: '90%', md: '600px' }}
        position="relative"
        initial={{ opacity: 0, y: -18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Nút đóng */}
        <CloseButton 
          position="absolute" 
          top="-40px" 
          right="0" 
          size="lg" 
          onClick={onClose} 
        />

        {/* Khung tìm kiếm chính */}
        <Flex
          align="center"
          bg={bg}
          borderRadius="full"
          boxShadow="0 10px 30px rgba(0,0,0,0.1)"
          px={4}
          py={2}
          border="1px solid"
          borderColor="gray.200"
        >
          <MdSearch size={28} color="gray.400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bạn đang tìm kiếm gì?"
            variant="unstyled"
            fontSize="lg"
            ml={3}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            autoFocus
          />
          
          <IconButton
            aria-label="Voice search"
            icon={isRecording ? <MdMicOff size={24} /> : <MdMic size={24} />}
            variant="ghost"
            color={isRecording ? "red.500" : "gray.500"}
            onClick={isRecording ? stopRecording : startRecording}
            className={isRecording ? "pulse-anim" : ""}
          />
        </Flex>

        {isRecording && (
          <Text textAlign="center" mt={3} color="red.500" fontWeight="bold">
            Đang ghi âm... Nhấn lại icon mic để hoàn tất.
          </Text>
        )}

        {/* Lịch sử & Gợi ý */}
        <Flex mt={8} direction={{ base: 'column', md: 'row' }} gap={8}>
          <Box flex={1}>
            <Text fontWeight="bold" mb={4} color="gray.500">LỊCH SỬ TÌM KIẾM</Text>
            <VStack align="stretch" spacing={3}>
              {searchHistory.map((item, i) => (
                <HStack 
                  key={i} 
                  cursor="pointer" 
                  _hover={{ color: 'brand.500' }}
                  onClick={() => handleSearch(item)}
                >
                  <MdHistory />
                  <Text>{item}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
          <Box flex={1}>
            <Text fontWeight="bold" mb={4} color="gray.500">TÌM KIẾM PHỔ BIẾN</Text>
            <Flex wrap="wrap" gap={2}>
              {popularSearches.map((item, i) => (
                <Box
                  key={i}
                  px={4}
                  py={2}
                  bg="gray.100"
                  _dark={{ bg: 'whiteAlpha.200' }}
                  borderRadius="full"
                  fontSize="sm"
                  cursor="pointer"
                  _hover={{ bg: 'brand.500', color: 'white' }}
                  onClick={() => handleSearch(item)}
                >
                  {item}
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>
      </MotionBox>

      {/* Animation cho mic */}
      <style>{`
        .pulse-anim {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
          100% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
        }
      `}</style>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
