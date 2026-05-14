import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Input,
  Text,
  VStack,
  useDisclosure,
  useColorModeValue,
  Image,
  Link,
} from '@chakra-ui/react';
import { ChatIcon, CloseIcon } from '@chakra-ui/icons';
import { MdSend } from 'react-icons/md';
import { useChat } from 'contexts/ChatContext';
import { useUser } from 'contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { useAppToast } from 'utils/ToastHelper';
import ChatService from 'services/ChatService';
import logo from 'assets/img/auth/auth.png';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatWidget() {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const toast = useAppToast();

  const {
    userConversation,
    setUserConversation,
    userMessages,
    setUserMessages,
    userHasUnread,
    setUserHasUnread,
    sendMessage,
    setIsChatOpen,
    botMessages,
  } = useChat();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [input, setInput] = useState('');
  const [chatMode, setChatMode] = useState('BOT'); // 'BOT' | 'SHOP'

  // Popup background
  const bg = useColorModeValue('white', 'navy.800');

  // 🎨 Input area colors (sync với ChatPage)
  const inputBg = useColorModeValue('white', 'navy.700');
  const inputBorderColor = useColorModeValue('gray.200', 'whiteAlpha.400');
  const sendBtnBg = useColorModeValue('gray.100', 'navy.600');
  const sendBtnHover = useColorModeValue('gray.200', 'navy.500');
  const inputTextColor = useColorModeValue(
    'secondaryGray.900',
    'whiteAlpha.900',
  );

  const messagesContainerRef = useRef(null);

  // ✅ Auto-scroll to bottom when messages arrive (FIXED: Messages must show at bottom)
  useEffect(() => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }, 0);
    }
  }, [userMessages]);

  // Original open popup scroll
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [isOpen]);

  // ✅ Auto-scroll when switching between BOT and SHOP tabs
  useEffect(() => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }, 0);
    }
  }, [chatMode]);

  const handleOpenPopup = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to chat for support!');
      navigate('/auth/sign-in');
      return;
    }
    setUserHasUnread(false);
    localStorage.setItem('chat:lastReadAt', Date.now());
    setIsChatOpen(true);
    onOpen();
  };

  const handleClosePopup = () => {
    setIsChatOpen(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    const initChat = async () => {
      try {
        const convRes = await ChatService.start();
        const conv = convRes.data;
        setUserConversation(conv);
        const msgRes = await ChatService.messages(conv.id, 0, 50);
        setUserMessages(msgRes.data.content || []);
      } catch {
        toast.error('Failed to start chat');
      }
    };
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAuthenticated, setUserConversation, setUserMessages]);

  // Cho phép mở ChatWidget từ bên ngoài (VD: nút "Chat now" ở ProductDetail)
  useEffect(() => {
    const handleExternalOpen = () => {
      if (!isOpen) {
        handleOpenPopup();
      }
    };

    window.addEventListener('trendify:open-chat', handleExternalOpen);
    return () => {
      window.removeEventListener('trendify:open-chat', handleExternalOpen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || !userConversation) return;

    const trimmed = input.trim();

    // ✅ Send message WITHOUT gắn [SHOP] vào content
    // Backend sẽ handle chatChannel/chatMode logic
    sendMessage(userConversation.id, trimmed, chatMode);
    setInput('');
  };

  // MARKDOWN MESSAGE RENDERER
  const MessageContent = ({ content }) => {
    const safeContent = content || "";
    const processedContent = safeContent
      .replace(
        /https?:\/\/res\.cloudinary\.com\/[^\s]+/g,
        (url) => `![](${url})`,
      )
      .replace(
        /http:\/\/localhost:3000\/user\/product\/detail\/[^\s]+/g,
        (url) => {
          const slug = url.split('/').pop();
          const name = slug
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          return `**[${name}](${url})**`;
        },
      );

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <Text mb={2} fontSize="sm" lineHeight="1.5">
              {children}
            </Text>
          ),
          strong: ({ children }) => (
            <Text as="span" fontWeight="bold" color="blue.300">
              {children}
            </Text>
          ),
          a: ({ href, children }) => (
            <Link
              href={href}
              color="blue.300"
              fontWeight="bold"
              isExternal
              textDecoration="underline"
            >
              {children}
            </Link>
          ),
          img: ({ src }) => (
            <Image
              src={src}
              alt="Product"
              maxW="220px"
              borderRadius="lg"
              my={3}
              boxShadow="md"
              cursor="pointer"
              onClick={() => window.open(src, '_blank')}
              _hover={{ transform: 'scale(1.05)', transition: '0.2s' }}
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <Box position="fixed" bottom="28px" right="24px" zIndex="2100">
        <IconButton
          aria-label="Chat"
          icon={<ChatIcon />}
          size="lg"
          borderRadius="full"
          bg="brand.500"
          color="white"
          _hover={{ bg: 'brand.600' }}
          onClick={isOpen ? handleClosePopup : handleOpenPopup}
        />
        {userHasUnread && !isOpen && (
          <Box
            position="absolute"
            top="-4px"
            right="-4px"
            w="16px"
            h="16px"
            borderRadius="full"
            bg="red.400"
          />
        )}
      </Box>

      {/* Chat Popup */}
      {isOpen && (
        <Box
          position="fixed"
          bottom="90px"
          right="24px"
          w={{ base: '90%', sm: '380px' }}
          h="560px"
          bg={bg}
          borderRadius="xl"
          boxShadow="2xl"
          zIndex="2100"
          display="flex"
          flexDir="column"
        >
          {/* Header */}
          <Flex
            align="center"
            justify="space-between"
            px={4}
            py={3}
            bg="brand.500"
            borderTopRadius="xl"
          >
            <Flex align="center" gap={3}>
              <Image
                src={logo}
                boxSize="36px"
                borderRadius="full"
                border="2px solid white"
              />
              <Box>
                <Text fontWeight="bold" color="white" fontSize="lg">
                  {chatMode === 'BOT' ? 'Trendify Bot' : 'Trendify Support'}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.800">
                  {chatMode === 'BOT'
                    ? 'Online • 24/7 virtual assistant'
                    : 'Chat directly with our staff • We will reply as soon as possible'}
                </Text>
              </Box>
            </Flex>

            <Flex align="center" gap={2}>
              {/* Toggle BOT / SHOP */}
              <Box
                bg="whiteAlpha.200"
                borderRadius="full"
                p="2px"
                display={{ base: 'none', sm: 'block' }}
              >
                <Flex>
                  <Box
                    as="button"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="semibold"
                    bg={chatMode === 'BOT' ? 'white' : 'transparent'}
                    color={chatMode === 'BOT' ? 'brand.500' : 'whiteAlpha.900'}
                    onClick={() => setChatMode('BOT')}
                  >
                    Bot
                  </Box>
                  <Box
                    as="button"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="semibold"
                    bg={chatMode === 'SHOP' ? 'white' : 'transparent'}
                    color={chatMode === 'SHOP' ? 'brand.500' : 'whiteAlpha.900'}
                    onClick={() => setChatMode('SHOP')}
                  >
                    Shop
                  </Box>
                </Flex>
              </Box>

              <IconButton
                aria-label="Close"
                icon={<CloseIcon />}
                size="sm"
                bg="whiteAlpha.300"
                color="white"
                onClick={handleClosePopup}
              />
            </Flex>
          </Flex>

          {/* Messages */}
          <Flex
            ref={messagesContainerRef}
            flex="1"
            px={4}
            py={4}
            overflowY="auto"
            direction="column"
            gap={4}
          >
            <VStack spacing={4} align="stretch">
              {[...(chatMode === 'BOT' ? botMessages : userMessages)].reverse().map((m) => {
                // ✅ FIXED: Properly distinguish message types
                const isMine = m.senderType === 'USER';
                const isBot = m.senderType === 'BOT';
                const isAdmin = m.senderType === 'ADMIN';
                const isEmployee = m.senderType === 'EMPLOYEE';

                // Determine colors based on sender type
                let bgColor = 'gray.200';
                let textColor = 'gray.900';

                if (isMine) {
                  bgColor = 'blue.500';
                  textColor = 'white';
                } else if (isBot) {
                  bgColor = 'green.500';
                  textColor = 'white';
                } else if (isAdmin || isEmployee) {
                  bgColor = 'orange.400';
                  textColor = 'white';
                }

                return (
                  <Flex key={m.id} justify={isMine ? 'flex-end' : 'flex-start'}>
                    <Box
                      maxW="88%"
                      px={4}
                      py={3}
                      borderRadius="xl"
                      bg={bgColor}
                      color={textColor}
                      boxShadow="lg"
                    >
                      {!isMine && (
                        <Text
                          fontSize="xs"
                          opacity={0.9}
                          mb={1}
                          fontWeight="bold"
                        >
                          {m.senderName}
                          {m.chatChannel === 'SHOP' && ' (Shop)'}
                          {isBot && ' (Bot)'}
                        </Text>
                      )}
                      <MessageContent content={m.content} />
                    </Box>
                  </Flex>
                );
              })}
            </VStack>
          </Flex>

          {/* Input */}
          <Flex
            p={3}
            borderTopWidth="1px"
            gap={2}
            bg={inputBg}
            borderColor={inputBorderColor}
          >
            <Input
              size="md"
              placeholder={
                chatMode === 'BOT'
                  ? 'Message the Bot...'
                  : 'Message the Shop directly...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                !e.shiftKey &&
                (e.preventDefault(), handleSend())
              }
              borderRadius="full"
              bg={inputBg}
              borderWidth="1px"
              borderColor={inputBorderColor}
              focusBorderColor="brand.500"
              _placeholder={{ color: 'whiteAlpha.500' }}
              color={inputTextColor}
            />
            <IconButton
              aria-label="Send"
              icon={<MdSend />}
              onClick={handleSend}
              isDisabled={!input.trim()}
              bg={sendBtnBg}
              _hover={{ bg: sendBtnHover }}
              borderRadius="full"
              color={inputTextColor}
            />
          </Flex>
        </Box>
      )}
    </>
  );
}
