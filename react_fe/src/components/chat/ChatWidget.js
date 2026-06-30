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
  Button,
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
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

const formatProductPrice = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const StableProductCards = React.memo(function StableProductCards({
  products = [],
  borderColor,
  bg,
  navigate,
}) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <VStack align="stretch" spacing={2} mt={3}>
      {products.map((product) => (
        <Flex
          key={product.id || product.slug}
          gap={3}
          p={2}
          borderWidth="1px"
          borderColor={borderColor}
            borderRadius="8px"
            bg={bg}
            align="center"
        >
          <Image
            src={product.imageUrl || product.thumbnail}
            alt={product.name}
            boxSize="56px"
            objectFit="cover"
            borderRadius="6px"
            fallbackSrc={logo}
          />
          <Box flex="1" minW={0}>
            <Text fontSize="sm" fontWeight="700" noOfLines={2}>
              {product.name}
            </Text>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {product.categoryName}
            </Text>
            <Text fontSize="sm" fontWeight="700" color="brand.500">
              {formatProductPrice(product.price)}
            </Text>
          </Box>
          <Button
            size="xs"
            bg="#111827"
            color="white"
            borderRadius="4px"
            _hover={{ bg: '#F97316' }}
            flexShrink={0}
            onClick={() => product.slug && navigate(`/user/product/detail/${product.slug}`)}
          >
            Xem sản phẩm
          </Button>
        </Flex>
      ))}
    </VStack>
  );
});

const StableCategoryCards = React.memo(function StableCategoryCards({
  categories = [],
  borderColor,
  bg,
  navigate,
}) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  return (
    <VStack align="stretch" spacing={2} mt={3}>
      {categories.map((category) => (
        <Flex
          key={category.id || category.slug}
          gap={3}
          p={2}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="8px"
          bg={bg}
          align="center"
        >
          <Image
            src={category.thumbnail}
            alt={category.name}
            boxSize="48px"
            objectFit="cover"
            borderRadius="6px"
            fallbackSrc={logo}
          />
          <Box flex="1" minW={0}>
            <Text fontSize="sm" fontWeight="700" noOfLines={2}>
              {category.name}
            </Text>
            {category.description && (
              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                {category.description}
              </Text>
            )}
          </Box>
          <Button
            size="xs"
            bg="#111827"
            color="white"
            borderRadius="4px"
            _hover={{ bg: '#F97316' }}
            flexShrink={0}
            onClick={() => category.slug && navigate(`/user/product/${category.slug}`)}
          >
            Xem
          </Button>
        </Flex>
      ))}
    </VStack>
  );
});

const StableOrderCards = React.memo(function StableOrderCards({
  orders = [],
  borderColor,
  bg,
}) {
  if (!Array.isArray(orders) || orders.length === 0) return null;

  return (
    <VStack align="stretch" spacing={2} mt={3}>
      {orders.map((order) => (
        <Box
          key={order.code}
          p={2.5}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="8px"
          bg={bg}
        >
          <Flex justify="space-between" gap={3}>
            <Text fontSize="sm" fontWeight="800" noOfLines={1}>
              {order.code}
            </Text>
            <Text fontSize="xs" fontWeight="700" color="#F97316" flexShrink={0}>
              {order.statusLabel || order.status}
            </Text>
          </Flex>
          <Text fontSize="sm" fontWeight="700" mt={1}>
            {formatProductPrice(order.total)}
          </Text>
          {order.createdAt && (
            <Text fontSize="xs" color="gray.500">
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </Text>
          )}
        </Box>
      ))}
    </VStack>
  );
});

const StableOutfitCards = React.memo(function StableOutfitCards({
  outfit,
  borderColor,
  bg,
  navigate,
}) {
  if (!outfit) return null;
  const items = [
    ['Ao', outfit.top],
    ['Quan', outfit.bottom],
    ['Giay', outfit.shoes],
    ['Phu kien', outfit.accessory],
  ].filter(([, product]) => product);

  return (
    <VStack align="stretch" spacing={2} mt={3}>
      {outfit.reason && (
        <Text fontSize="xs" color="gray.600">
          {outfit.reason}
        </Text>
      )}
      {items.map(([label, product]) => (
        <Flex
          key={`${label}-${product.id || product.slug}`}
          gap={3}
          p={2}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="8px"
          bg={bg}
          align="center"
        >
          <Image
            src={product.imageUrl || product.thumbnail}
            alt={product.name}
            boxSize="54px"
            objectFit="cover"
            borderRadius="6px"
            fallbackSrc={logo}
          />
          <Box flex="1" minW={0}>
            <Text fontSize="xs" color="gray.500" fontWeight="700">
              {label}
            </Text>
            <Text fontSize="sm" fontWeight="700" noOfLines={2}>
              {product.name}
            </Text>
            <Text fontSize="sm" fontWeight="700" color="brand.500">
              {formatProductPrice(product.price)}
            </Text>
          </Box>
          <Button
            size="xs"
            bg="#111827"
            color="white"
            borderRadius="4px"
            _hover={{ bg: '#F97316' }}
            flexShrink={0}
            onClick={() => product.slug && navigate(`/user/product/detail/${product.slug}`)}
          >
            Xem
          </Button>
        </Flex>
      ))}
      {outfit.sizeSuggestion && (
        <Text fontSize="xs" color="gray.600">
          Goi y size: {outfit.sizeSuggestion}. Ban nen kiem tra bang size cua tung san pham truoc khi dat.
        </Text>
      )}
    </VStack>
  );
});

const StableMessageContent = React.memo(function StableMessageContent({ content }) {
  const safeContent = String(content || "")
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
          <Text mb={1.5} fontSize="sm" lineHeight="1.55" whiteSpace="normal" overflowWrap="break-word">
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
            maxW="100%"
            maxH="180px"
            objectFit="contain"
            borderRadius="6px"
            my={2}
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
});

export default function ChatWidget({ hidden = false }) {
  const { isAuthenticated, user } = useUser();
  const toast = useAppToast();
  const navigate = useNavigate();
  const isStaff =
    isAuthenticated && ['ADMIN', 'EMPLOYEE'].includes(user?.roleName);

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
  const [chatMode, setChatMode] = useState('BOT');
  const [guestBotConversationId] = useState(() => {
    const storageKey = 'trendify:guestBotConversationId';
    const existingId = localStorage.getItem(storageKey);
    if (existingId) return existingId;
    const newId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(storageKey, newId);
    return newId;
  });


  const bg = useColorModeValue('white', 'navy.800');


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
  const productCardBg = useColorModeValue('white', 'navy.800');

  const messagesContainerRef = useRef(null);
  const chatUserKey = user?.id || user?.email || user?.username || null;
  const authenticatedBotConversationId = chatUserKey
    ? `account-${chatUserKey}`
    : null;
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


  useEffect(() => {
    window.requestAnimationFrame(() => scrollMessagesToBottom('smooth'));
  }, [userMessages, botMessages, isBotLoading]);


  useEffect(() => {
    if (isOpen) window.requestAnimationFrame(() => scrollMessagesToBottom('auto'));
  }, [isOpen]);


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

  }, [setIsChatOpen]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated || isStaff || chatMode !== 'SHOP') return;
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

  }, [
    isOpen,
    isAuthenticated,
    isStaff,
    chatMode,
    setUserConversation,
    setUserMessages,
  ]);

  useEffect(() => {
    if (isStaff && chatMode === 'SHOP') {
      setChatMode('BOT');
    }
  }, [isStaff, chatMode]);


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

  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    if (chatMode === 'SHOP' && isStaff) {
      toast.warning('Tài khoản quản trị chỉ chat với khách hàng trong trang Hỗ trợ Chat.');
      setChatMode('BOT');
      return;
    }

    if (chatMode === 'SHOP' && !isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để chat với nhân viên hỗ trợ.');
      return;
    }

    const conversationId =
      chatMode === 'BOT'
        ? isAuthenticated
          ? userConversation?.id || authenticatedBotConversationId
          : guestBotConversationId
        : userConversation?.id;

    if (!conversationId) return;

    const trimmed = input.trim();



    sendMessage(conversationId, trimmed, chatMode);
    setInput('');
  };

  const selectChatMode = (mode) => {
    if (mode === 'SHOP' && isStaff) {
      toast.info('Vui lòng dùng trang Hỗ trợ Chat để trả lời khách hàng.');
      return;
    }
    if (mode === 'SHOP' && !isAuthenticated) {
      toast.warning('Bạn cần đăng nhập để chat với nhân viên hỗ trợ.');
      return;
    }
    setChatMode(mode);
  };

  const formatPrice = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));


  const ProductCards = ({ products = [] }) => {
    if (!Array.isArray(products) || products.length === 0) return null;

    return (
      <VStack align="stretch" spacing={2} mt={3}>
        {products.map((product) => (
          <Flex
            key={product.id || product.slug}
            gap={3}
            p={2}
            borderWidth="1px"
            borderColor={botBorderColor}
            borderRadius="md"
            bg={productCardBg}
            align="center"
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              boxSize="64px"
              objectFit="cover"
              borderRadius="md"
              fallbackSrc={logo}
            />
            <Box flex="1" minW={0}>
              <Text fontSize="sm" fontWeight="700" noOfLines={2}>
                {product.name}
              </Text>
              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                {product.categoryName}
              </Text>
              <Text fontSize="sm" fontWeight="700" color="brand.500">
                {formatPrice(product.price)}
              </Text>
            </Box>
            <Button
              size="xs"
              colorScheme="orange"
              flexShrink={0}
              onClick={() => product.slug && navigate(`/user/product/detail/${product.slug}`)}
            >
              Xem sản phẩm
            </Button>
          </Flex>
        ))}
      </VStack>
    );
  };


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
            <Text mb={2} fontSize="sm" lineHeight="1.5" whiteSpace="pre-wrap" overflowWrap="break-word">
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
      {}
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

      {}
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            position="fixed"
            top={{ base: '12px', sm: 'auto' }}
            bottom={{ base: '76px', sm: '90px' }}
            right={{ base: '12px', sm: '24px' }}
            left={{ base: '12px', sm: 'auto' }}
            w={{ base: 'auto', sm: '390px' }}
            h={{ base: 'auto', sm: '560px' }}
            maxH={{ base: 'none', sm: 'calc(100dvh - 104px)' }}
            bg={bg}
            borderRadius="10px"
            boxShadow="0 18px 48px rgba(15, 23, 42, 0.18)"
            zIndex="2100"
            display="flex"
            flexDir="column"
            minH={0}
            overflow="hidden"
            fontFamily="'TT Commons Pro', Inter, system-ui, sans-serif"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
          {}
          <Flex
            align="center"
            justify="space-between"
            px={{ base: 3, sm: 4 }}
            py={3}
            bg="brand.500"
            borderTopRadius="10px"
            flexShrink={0}
          >
            <Flex align="center" gap={3}>
              <Flex
                boxSize="32px"
                borderRadius="8px"
                bg="white"
                color="brand.500"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <ChatIcon boxSize="16px" />
              </Flex>
              <Box>
                <Text
                  fontWeight="800"
                  color="white"
                  fontSize="md"
                  noOfLines={1}
                >
                  {chatMode === 'BOT' ? 'Trendify Trợ lý' : 'Trendify Hỗ trợ khách hàng'}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.800" lineHeight="1.4">
                  {chatMode === 'BOT'
                    ? 'Đang hoạt động • Trợ lý ảo 24/7'
                    : 'Đang hoạt động • Cửa hàng sẽ phản hồi sớm nhất'}
                </Text>
              </Box>
            </Flex>

            <Flex align="center" gap={2}>
              {}
              {!isStaff && <Box
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
              </Box>}

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

          {}
          <Flex
            ref={messagesContainerRef}
            flex="1"
            minH={0}
            px={4}
            py={4}
            overflowY="auto"
            direction="column"
            gap={3}
            fontFamily="'TT Commons Pro', Inter, system-ui, sans-serif"
          >
            <VStack spacing={4} align="stretch">
              {[...(chatMode === 'BOT' ? botMessages : userMessages)].reverse().map((m) => {

                const isMine = m.senderType === 'USER';
                const isBot = m.senderType === 'BOT';
                const isAdmin = m.senderType === 'ADMIN';
                const isEmployee = m.senderType === 'EMPLOYEE';
                const senderDisplayName = isEmployee
                  ? `${m.senderName || 'Nhân viên'} - nhân viên hỗ trợ`
                  : m.senderName;


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
                      px={3}
                      py={2.5}
                      borderRadius="8px"
                      bg={bgColor}
                      color={textColor}
                      boxShadow="sm"
                      borderWidth={borderWidth}
                      borderColor={borderColor}
                      fontFamily="inherit"
                      fontSize="14px"
                      lineHeight="1.65"
                      whiteSpace="pre-wrap"
                      sx={{ '& p:last-child': { marginBottom: 0 } }}
                      overflowWrap="break-word"
                      overflow="visible"
                    >
                      {!isMine && (
                        <Text
                          fontSize="xs"
                          opacity={0.9}
                          mb={1}
                          fontWeight="bold"
                        >
                          {senderDisplayName}
                          {isBot && ' (Trợ lý)'}
                        </Text>
                      )}
                      <StableMessageContent content={m.content} />
                      {isBot && (
                        <>
                          <StableProductCards
                            products={m.products}
                            borderColor={botBorderColor}
                            bg={productCardBg}
                            navigate={navigate}
                          />
                          <StableCategoryCards
                            categories={m.categories}
                            borderColor={botBorderColor}
                            bg={productCardBg}
                            navigate={navigate}
                          />
                          <StableOutfitCards
                            outfit={m.outfit}
                            borderColor={botBorderColor}
                            bg={productCardBg}
                            navigate={navigate}
                          />
                          <StableOrderCards
                            orders={m.orders}
                            borderColor={botBorderColor}
                            bg={productCardBg}
                          />
                        </>
                      )}
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
                    borderRadius="8px"
                    bg={botBgColor}
                    color={botTextColor}
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor={botBorderColor}
                    fontFamily="inherit"
                    fontSize="14px"
                    lineHeight="1.65"
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

          {}
          <Flex
            p={3}
            borderTopWidth="1px"
            gap={2}
            bg={inputBg}
            borderColor={inputBorderColor}
            flexShrink={0}
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
