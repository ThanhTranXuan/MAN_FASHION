import React, { useState, useRef } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Input,
  Text,
  useColorModeValue,
  Slide,
  CloseButton,
  VStack,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { MdSearch, MdMic, MdMicOff, MdHistory, MdArrowForward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAppToast } from 'utils/ToastHelper';
import axios from 'axios';
import ApiUrl from 'constants/ApiUrl';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const toast = useAppToast();
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const bg = useColorModeValue('white', 'navy.900');
  const textColor = useColorModeValue('navy.700', 'white');
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm;codecs=opus' };
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error('Không thể truy cập microphone. Vui lòng cấp quyền.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const fallbackToWebSpeechAPI = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Trình duyệt không hỗ trợ Web Speech API.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info('Đang nghe qua Web Speech API (Browser Fallback)...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      toast.error('Lỗi nhận diện giọng nói (Web Speech API).');
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const sendAudioToBackend = async (blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        try {
          const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/v1/speech/recognize`, {
            audio: base64Audio
          });
          
          const data = res.data;
          if (data && data.results && data.results.length > 0) {
            const transcript = data.results[0].alternatives[0].transcript;
            setQuery(transcript);
            handleSearch(transcript);
          } else {
            toast.info('Không nhận diện được giọng nói. Vui lòng thử lại.');
          }
        } catch (err) {
          if (err.response?.status === 400 && err.response?.data?.error === 'Chưa cấu hình nhận diện giọng nói') {
             toast.info('Hệ thống chưa cấu hình API Key. Thử dùng Web Speech API...');
             fallbackToWebSpeechAPI();
          } else if (err.response?.status === 404) {
             toast.warning('Backend proxy chưa sẵn sàng. Đang chuyển sang Web Speech API...');
             fallbackToWebSpeechAPI();
          } else {
             toast.error('Lỗi khi gọi dịch vụ nhận diện giọng nói.');
             fallbackToWebSpeechAPI();
          }
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (err) {
      setIsProcessing(false);
      toast.error('Lỗi xử lý âm thanh.');
      fallbackToWebSpeechAPI();
    }
  };

  if (!isOpen) return null;

  return (
    <Box
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
    >
      <Box w={{ base: '90%', md: '600px' }} position="relative">
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
          
          {isProcessing ? (
            <Spinner size="md" color="brand.500" mx={2} />
          ) : (
            <IconButton
              aria-label="Voice search"
              icon={isRecording ? <MdMicOff size={24} /> : <MdMic size={24} />}
              variant="ghost"
              color={isRecording ? "red.500" : "gray.500"}
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? "pulse-anim" : ""}
            />
          )}
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
      </Box>

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
    </Box>
  );
}
