import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Input,
  Text,
  VStack,
  useColorModeValue,
  Image,
  Link,
} from '@chakra-ui/react';
import { ChatIcon, CloseIcon } from '@chakra-ui/icons';
import { MdSend } from 'react-icons/md';
import { useChat } from 'contexts/ChatContext';
import { useUser } from 'contexts/UserContext';
import { useAppToast } from 'utils/ToastHelper';
import ChatService from 'services/ChatService';
import logo from 'assets/img/auth/auth.png';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnimatePresence, motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function ChatWidget({ hidden = false }) {
  const { isAuthenticated, user } = useUser();
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
    isBotLoading,
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [isWidgetHidden, setIsWidgetHidden] = useState(false);
  const [input, setInput] = useState('');
  const [chatMode, setChatMode] = useState('BOT'); // 'BOT' | 'SHOP'
  const [guestBotConversationId] = useState(() => {
    const storageKey = 'trendify:guestBotConversationId';
    const existingId = localStorage.getItem(storageKey);
    if (existingId) return existingId;
    const newId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(storageKey, newId);
    return newId;
  });

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

  const botBgColor = useColorModeValue('gray.50', 'navy.700');
  const botTextColor = useColorModeValue('gray.900', 'white');
  const botBorderColor = useColorModeValue('gray.200', 'navy.600');

  const messagesContainerRef = useRef(null);
  const chatUserKey = user?.id || user?.email || user?.username || null;
  const chatLastReadKey = chatUserKey ? `chat:lastReadAt:${chatUserKey}` : null;

  const scrollMessagesToBottom = (behavior = 'smooth') => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
  };

  useEffect(() => {
    if (!hidden) {
      setIsWidgetHidden(false);
      return;
    }
    setIsWidgetHidden(true);
    setIsChatOpen(false);
    setIsOpen(false);
  }, [hidden, setIsChatOpen]);

  // ✅ Auto-scroll to bottom when messages arrive (FIXED: Messages must show at bottom)
  useEffect(() => {
    window.requestAnimationFrame(() => scrollMessagesToBottom('smooth'));
  }, [userMessages, botMessages, isBotLoading]);

  // Original open popup scroll
  useEffect(() => {
    if (isOpen) window.requestAnimationFrame(() => scrollMessagesToBottom('auto'));
  }, [isOpen]);

  // ✅ Auto-scroll when switching between BOT and SHOP tabs
  useEffect(() => {
    window.requestAnimationFrame(() => scrollMessagesToBottom('auto'));
  }, [chatMode]);

  const handleOpenPopup = () => {
    setUserHasUnread(false);
    if (chatLastReadKey) {
      localStorage.setItem(chatLastReadKey, Date.now());
    }
    setIsChatOpen(true);
    setIsOpen(true);
  };

  const handleClosePopup = () => {
    setIsChatOpen(false);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleHideChat = () => {
      setIsWidgetHidden(true);
      setIsChatOpen(false);
      setIsOpen(false);
    };
    const handleShowChat = () => {
      setIsWidgetHidden(false);
    };

    window.addEventListener('trendify:hide-chat', handleHideChat);
    window.addEventListener('trendify:show-chat', handleShowChat);
    return () => {
      window.removeEventListener('trendify:hide-chat', handleHideChat);
      window.removeEventListener('trendify:show-chat', handleShowChat);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsChatOpen]);

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
        toast.error('Không thể mở chat. Vui lòng thử lại.');
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
    if (!input.trim()) return;

    if (chatMode === 'SHOP' && !isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để chat với nhân viên hỗ trợ.');
      return;
    }

    const conversationId =
      chatMode === 'BOT'
        ? isAuthenticated
          ? userConversation?.id || guestBotConversationId
          : guestBotConversationId
        : userConversation?.id;

    if (!conversationId) return;

    const trimmed = input.trim();

    // ✅ Send message WITHOUT gắn [SHOP] vào content
    // Backend sẽ handle chatChannel/chatMode logic
    sendMessage(conversationId, trimmed, chatMode);
    setInput('');
  };

  const selectChatMode = (mode) => {
    if (mode === 'SHOP' && !isAuthenticated) {
      toast.warning('Bạn cần đăng nhập để chat với nhân viên hỗ trợ.');
      return;
    }
    setChatMode(mode);
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
              color="#4F46E5"
              fontWeight="600"
              isExternal
              _hover={{ textDecoration: 'underline' }}
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
      <AnimatePresence>
        {!isWidgetHidden && (
          <MotionBox
            position="fixed"
            bottom="28px"
            right="24px"
            zIndex="2100"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
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
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            position="fixed"
            bottom={{ base: '78px', sm: '90px' }}
            right={{ base: '12px', sm: '24px' }}
            left={{ base: '12px', sm: 'auto' }}
            w={{ base: 'auto', sm: '380px' }}
            h={{ base: 'min(560px, calc(100dvh - 104px))', sm: '560px' }}
            maxH="calc(100dvh - 104px)"
            bg={bg}
            borderRadius={{ base: 'lg', sm: 'xl' }}
            boxShadow="0 18px 48px rgba(15, 23, 42, 0.18)"
            zIndex="2100"
            display="flex"
            flexDir="column"
            overflow="hidden"
            fontFamily="inherit"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
          {/* Header */}
          <Flex
            align="center"
            justify="space-between"
            px={{ base: 3, sm: 4 }}
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
                <Text
                  fontWeight="bold"
                  color="white"
                  fontSize={{ base: 'md', sm: 'lg' }}
                  noOfLines={1}
                >
                  {chatMode === 'BOT' ? 'Trendify Trợ lý' : 'Trendify Hỗ trợ khách hàng'}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.800">
                  {chatMode === 'BOT'
                    ? 'Đang hoạt động • Trợ lý ảo 24/7'
                    : 'Đang hoạt động • Cửa hàng sẽ phản hồi sớm nhất'}
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
                    onClick={() => selectChatMode('BOT')}
                  >
                    Trợ lý
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
                    onClick={() => selectChatMode('SHOP')}
                  >
                    Cửa hàng
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
            fontFamily="inherit"
          >
            <VStack spacing={4} align="stretch">
              {[...(chatMode === 'BOT' ? botMessages : userMessages)].reverse().map((m) => {
                // ✅ FIXED: Properly distinguish message types
                const isMine = m.senderType === 'USER';
                const isBot = m.senderType === 'BOT';
                const isAdmin = m.senderType === 'ADMIN';
                const isEmployee = m.senderType === 'EMPLOYEE';

                // Determine colors based on sender type
                let bgColor = botBgColor;
                let textColor = botTextColor;
                let borderColor = botBorderColor;
                let borderWidth = '1px';

                if (isMine) {
                  bgColor = '#4F46E5';
                  textColor = 'white';
                  borderWidth = '0px';
                } else if (isAdmin || isEmployee) {
                  bgColor = 'brand.500';
                  textColor = 'white';
                  borderWidth = '0px';
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
                      boxShadow="sm"
                      borderWidth={borderWidth}
                      borderColor={borderColor}
                      fontFamily="inherit"
                      fontSize="14px"
                      lineHeight="1.55"
                    >
                      {!isMine && (
                        <Text
                          fontSize="xs"
                          opacity={0.9}
                          mb={1}
                          fontWeight="bold"
                        >
                          {m.senderName}
                          {m.chatChannel === 'SHOP' && ' (Cửa hàng)'}
                          {isBot && ' (Trợ lý)'}
                        </Text>
                      )}
                      <MessageContent content={m.content} />
                    </Box>
                  </Flex>
                );
              })}
              {chatMode === 'BOT' && isBotLoading && (
                <Flex justify="flex-start">
                  <Box
                    maxW="88%"
                    px={4}
                    py={3}
                    borderRadius="xl"
                    bg={botBgColor}
                    color={botTextColor}
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor={botBorderColor}
                    fontFamily="inherit"
                    fontSize="14px"
                    lineHeight="1.55"
                  >
                    <Text fontSize="xs" opacity={0.9} mb={1} fontWeight="bold">
                      Trendify Bot (Trợ lý)
                    </Text>
                    <Text fontSize="sm" lineHeight="1.5">
                      Đang trả lời...
                    </Text>
                  </Box>
                </Flex>
              )}
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
                  ? 'Nhập tin nhắn...'
                  : 'Nhập tin nhắn cho cửa hàng...'
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
              aria-label="Gửi"
              icon={<MdSend />}
              onClick={handleSend}
              isDisabled={!input.trim()}
              isLoading={chatMode === 'BOT' && isBotLoading}
              bg={sendBtnBg}
              _hover={{ bg: sendBtnHover }}
              borderRadius="full"
              color={inputTextColor}
            />
          </Flex>
          </MotionBox>
        )}
      </AnimatePresence>
    </>
  );
}
