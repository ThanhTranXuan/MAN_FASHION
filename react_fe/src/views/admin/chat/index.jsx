import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Flex,
  VStack,
  Text,
  Avatar,
  Badge,
  Input,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { useChat } from 'contexts/ChatContext';
import ChatService from 'services/ChatService';
import { MdSend } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Image, Link } from '@chakra-ui/react';
import { resolveImageUrl } from 'utils/ImageHelper';

const ADMIN_LAST_VISIT_KEY = 'chat:adminLastVisit';
const MESSAGES_PAGE_SIZE = 30;
const getAvatarSrc = (...candidates) => {
  const avatar = candidates.find(
    (value) => typeof value === 'string' && value.trim(),
  );
  return avatar ? resolveImageUrl(avatar) : undefined;
};

const AdminMessageContent = ({ content }) => {
  // Tự động chuyển các URL cloudinary thành markdown image
  const safeContent = content || "";
  const processedContent = safeContent
    .replace(
      /(https?:\/\/res\.cloudinary\.com\/[^\s]+)/g,
      (url) => `![](${url})`
    )
    // Tùy chọn: xử lý link sản phẩm localhost giống user nếu cần
    .replace(
      /(http:\/\/localhost:3000\/user\/product\/detail\/[^\s]+)/g,
      (url) => {
        const slug = url.split('/').pop();
        const name = slug
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        return `[${name}](${url})`;
      }
    );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <Text fontSize="sm" lineHeight="1.5" mb={1}>{children}</Text>,
        a: ({ href, children }) => (
          <Link href={href} color="blue.300" isExternal fontWeight="bold" textDecoration="underline">
            {children}
          </Link>
        ),
        img: ({ src }) => (
          <Image
            src={src}
            alt="Attached"
            maxW="300px"
            borderRadius="lg"
            my={2}
            boxShadow="sm"
            cursor="pointer"
            onClick={() => window.open(src, '_blank')}
            _hover={{ transform: 'scale(1.03)', transition: '0.2s' }}
          />
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default function ChatPage() {
  const {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    messages,
    setMessages,
    sendMessage,
    setHasNewChat,
  } = useChat();

  const [input, setInput] = useState('');
  const [msgPage, setMsgPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const messagesContainerRef = useRef(null);
  const preventAutoScrollRef = useRef(false);

  // 🎨 === Dark mode colors ===
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const appBg = useColorModeValue('gray.50', 'navy.900');
  const sidebarBg = useColorModeValue('white', 'navy.800');
  const activeBg = useColorModeValue('gray.100', 'navy.700');
  const hoverBg = useColorModeValue('gray.50', 'navy.600');
  const avatarBg = useColorModeValue('gray.300', 'whiteAlpha.300');
  const emptyTextColor = useColorModeValue('gray.500', 'whiteAlpha.600');

  const bubbleUserText = useColorModeValue('black', 'whiteAlpha.900');

  const inputBg = useColorModeValue('white', 'navy.700');
  const inputBorderColor = useColorModeValue('gray.200', 'whiteAlpha.400');
  const sendBtnBg = useColorModeValue('gray.100', 'navy.600');
  const sendBtnHover = useColorModeValue('gray.200', 'navy.500');

  // ✅ Load conversations on first mount
  const loadConversations = useCallback(async () => {
    try {
      const res = await ChatService.allAdmin(0, 50);
      const page = res.data;
      const list = (page.content || []).map((c) => ({ ...c, unread: 0 }));
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [setConversations]);

  useEffect(() => {
    if (conversations.length === 0) loadConversations();
  }, [conversations.length, loadConversations]);

  // ✅ Record visit and clear "new chat" badge
  useEffect(() => {
    localStorage.setItem(ADMIN_LAST_VISIT_KEY, Date.now());
    setHasNewChat(false);
    return () => localStorage.setItem(ADMIN_LAST_VISIT_KEY, Date.now());
  }, [setHasNewChat]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!activeConversation) return;

    const loadMessages = async () => {
      try {
        const res = await ChatService.messages(
          activeConversation.id,
          0,
          MESSAGES_PAGE_SIZE,
        );
        const page = res.data;
        // ĐẢO NGƯỢC mảng API trước khi đưa vào State
    const reversedMessages = page.content ? [...page.content].reverse() : [];
    
    setMessages(reversedMessages); // Thay vì setMessages(page.content || [])
        // setMessages(page.content || []);
        setMsgPage(0);
        setHasMoreMessages(!page.last);
        localStorage.setItem(
          `chat:lastRead:${activeConversation.id}`,
          Date.now(),
        );
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, unread: 0 } : c,
      ),
    );
  }, [activeConversation, setMessages, setConversations]);

  // 🔁 Load older messages when scrolling to top
  const handleLoadOlderMessages = async () => {
    if (!activeConversation || !hasMoreMessages || loadingOlder) return;
    const nextPage = msgPage + 1;

    setLoadingOlder(true);
    try {
      const el = messagesContainerRef.current;
      const prevScrollHeight = el?.scrollHeight || 0;

      const res = await ChatService.messages(
        activeConversation.id,
        nextPage,
        MESSAGES_PAGE_SIZE,
      );
      const page = res.data;
      const older = page.content || [];

      preventAutoScrollRef.current = true;
      setMessages((prev) => [...older, ...prev]);
      setMsgPage(nextPage);
      setHasMoreMessages(!page.last);

      setTimeout(() => {
        if (el) {
          el.scrollTop = el.scrollHeight - prevScrollHeight;
        }
      }, 0);
    } catch (err) {
      console.error('Failed to load older messages:', err);
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleMessagesScroll = (e) => {
    const el = e.target;
    if (el.scrollTop <= 20) {
      handleLoadOlderMessages();
    }
  };

  // 🔽 Auto scroll to latest message (except when loading older)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (preventAutoScrollRef.current) {
      preventAutoScrollRef.current = false;
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Send message
  const handleSend = () => {
    if (!input.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, input.trim(), 'SHOP');
    setInput('');
  };

  return (
    <Flex
      h={{ base: '72vh', lg: '80vh' }}
      minH={{ base: '560px', lg: '640px' }}
      direction={{ base: 'column', lg: 'row' }}
      bg={appBg}
      color={textColor}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="sm"
    >
      {/* Sidebar: conversation list */}
      <Box
        w={{ base: '100%', lg: '320px' }}
        h={{ base: '220px', lg: 'auto' }}
        flexShrink={0}
        borderRightWidth={{ base: 0, lg: '1px' }}
        borderBottomWidth={{ base: '1px', lg: 0 }}
        bg={sidebarBg}
        borderTopRadius="2xl"
        borderBottomLeftRadius={{ base: 0, lg: '2xl' }}
        overflowY="auto"
      >
        <VStack align="stretch" spacing={0}>
          {conversations.map((c) => (
            <Flex
              key={c.id}
              p={3}
              gap={3}
              align="center"
              bg={activeConversation?.id === c.id ? activeBg : sidebarBg}
              _hover={{ bg: hoverBg }}
              cursor="pointer"
              onClick={() => setActiveConversation(c)}
            >
              <Avatar
                name={c.userName}
                src={getAvatarSrc(c.userAvatarUrl, c.avatarUrl, c.avatar, c.imageUrl, c.profileImage)}
                bg={avatarBg}
              />
              <Box flex="1">
                <Text fontWeight="bold" noOfLines={1}>
                  {c.userName}
                </Text>
                <Text fontSize="sm" color={emptyTextColor} noOfLines={1}>
                  {c.lastMessageText}
                </Text>
              </Box>
              {c.unread > 0 && <Badge colorScheme="red">{c.unread}</Badge>}
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Chat panel */}
      <Flex
        flex="1"
        minH={0}
        minW={0}
        direction="column"
        bg={sidebarBg}
        borderBottomRadius="2xl"
        borderTopRightRadius={{ base: 0, lg: '2xl' }}
      >
        {!activeConversation ? (
          <Flex flex="1" align="center" justify="center">
            <Text color={emptyTextColor}>Chọn một cuộc hội thoại</Text>
          </Flex>
        ) : (
          <>
            {/* Header */}
            <Flex p={3} gap={3} align="center" borderBottomWidth="1px" borderColor={inputBorderColor}>
              <Avatar
                size="sm"
                name={activeConversation.userName}
                src={getAvatarSrc(
                  activeConversation.userAvatarUrl,
                  activeConversation.avatarUrl,
                  activeConversation.avatar,
                  activeConversation.imageUrl,
                  activeConversation.profileImage,
                )}
                bg={avatarBg}
              />
              <Text fontWeight="bold">{activeConversation.userName}</Text>
            </Flex>

            {/* Message list */}
            <VStack
              ref={messagesContainerRef}
              flex="1"
              overflowY="auto"
              spacing={4}
              p={4}
              align="stretch"
              onScroll={handleMessagesScroll}
            >
              {messages.map((m) => {
                const isEmployee = m.senderType === 'EMPLOYEE';
                const isBot = m.senderType === 'BOT';
                const isAdminSide = isEmployee || isBot; // EMPLOYEE + BOT on the right

                const bubbleBg = isBot
                  ? 'green.500' // bot bubble color
                  : isEmployee
                    ? 'blue.500' // employee bubble color
                    : 'gray.200'; // user bubble color

                const bubbleColor = isAdminSide ? 'white' : 'gray.900';

                return (
                  <Flex
                    key={m.id || `${m.senderType}-${m.createdAt}`}
                    gap={2}
                    align="flex-end"
                    justify={isAdminSide ? 'flex-end' : 'flex-start'}
                    maxW="full"
                  >
                    {/* Left avatar (user) */}
                    {!isAdminSide && (
                      <Avatar
                        size="sm"
                        name={m.senderName || 'User'}
                        src={getAvatarSrc(
                          m.senderAvatarUrl,
                          m.avatarUrl,
                          m.avatar,
                          m.imageUrl,
                          m.profileImage,
                          activeConversation.userAvatarUrl,
                        )}
                        bg="gray.400"
                        color="white"
                      />
                    )}

                    <Box
                      maxW={{ base: '85%', md: '78%' }}
                      px={4}
                      py={3}
                      borderRadius="2xl"
                      bg={bubbleBg}
                      color={bubbleColor}
                      boxShadow="md"
                      borderTopLeftRadius={isAdminSide ? '2xl' : 'md'}
                      borderTopRightRadius={isAdminSide ? 'md' : '2xl'}
                    >
                      {isBot && (
                        <Text fontSize="xs" mb={1} opacity={0.8} fontWeight="bold">
                          Trendify Bot
                        </Text>
                      )}
                      {/* Thay thế <Text>{m.content}</Text> bằng component mới */}
                      <AdminMessageContent content={m.content} />
                    </Box>

                    {/* Right avatar (employee + bot) */}
                    {isAdminSide && (
                      <Avatar
                        size="sm"
                        name={isBot ? 'Trendify Bot' : m.senderName || 'Admin'}
                        src={!isBot ? getAvatarSrc(
                          m.senderAvatarUrl,
                          m.avatarUrl,
                          m.avatar,
                          m.imageUrl,
                          m.profileImage,
                        ) : undefined}
                        bg={isBot ? 'green.600' : 'blue.600'}
                        color="white"
                      />
                    )}
                  </Flex>
                );
              })}

              {loadingOlder && (
                <Flex justify="center">
                  <Text fontSize="sm" color={emptyTextColor}>
                    Đang tải tin nhắn cũ...
                  </Text>
                </Flex>
              )}
            </VStack>

            {/* Input box */}
            <Flex
              p={3}
              borderTopWidth="1px"
              gap={2}
              bg={inputBg}
              borderColor={inputBorderColor}
            >
              <Input
                placeholder="Nhập tin nhắn của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                bg={inputBg}
                borderWidth="1px"
                borderRadius="lg"
                borderColor={inputBorderColor}
                _placeholder={{ color: 'whiteAlpha.500' }}
                color={bubbleUserText}
              />

              <IconButton
                icon={<MdSend />}
                onClick={handleSend}
                aria-label="Send"
                bg={sendBtnBg}
                _hover={{ bg: sendBtnHover }}
                borderRadius="lg"
                color={bubbleUserText}
              />
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
}
