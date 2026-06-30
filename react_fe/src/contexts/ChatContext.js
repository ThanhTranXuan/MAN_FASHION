import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import ApiUrl from 'constants/ApiUrl';
import ChatSocketHelper from 'utils/ChatSocketHelper';
import ChatService from 'services/ChatService';
import { useUser } from './UserContext';

const ChatContext = createContext();
const BOT_HISTORY_KEY_PREFIX = 'trendify:botMessages:v2';
const BOT_SUGGESTIONS_KEY_PREFIX = 'trendify:latestProductSuggestions:v2';
const CHAT_LAST_READ_KEY_PREFIX = 'chat:lastReadAt';
const GUEST_BOT_STORAGE_SCOPE = 'guest';
const STAFF_CHAT_UNREAD_KEY = 'chat:staffUnreadConversations';

const getChatUserKey = (user) => {
  if (!user) return null;
  return user.id || user.email || user.username || user.fullName || null;
};

const getScopedStorageKey = (prefix, userKey) =>
  userKey ? `${prefix}:${userKey}` : null;

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const incrementStoredStaffUnread = (conversationId) => {
  if (!conversationId) return;
  const current = safeJsonParse(localStorage.getItem(STAFF_CHAT_UNREAD_KEY), {});
  current[conversationId] = Number(current[conversationId] || 0) + 1;
  localStorage.setItem(STAFF_CHAT_UNREAD_KEY, JSON.stringify(current));
};

const normalizeId = (value) =>
  value === undefined || value === null ? null : String(value);

const getMessageConversationId = (message, fallbackConversationId = null) =>
  normalizeId(
    message?.conversationId ??
      message?.conversation?.id ??
      message?.chatId ??
      fallbackConversationId,
  );

const mergeMessagesById = (
  currentMessages,
  incomingMessages,
  { conversationId = null, sortDirection = 'desc' } = {},
) => {
  const targetConversationId = normalizeId(conversationId);
  const merged = [...currentMessages];

  incomingMessages.forEach((incoming) => {
    if (!incoming) return;
    const incomingConversationId = getMessageConversationId(incoming, targetConversationId);
    if (targetConversationId && incomingConversationId !== targetConversationId) return;

    const normalizedIncoming = incomingConversationId
      ? { ...incoming, conversationId: incoming.conversationId ?? incomingConversationId }
      : incoming;

    const existingIndex = merged.findIndex((message) => {
      const messageConversationId = getMessageConversationId(message, targetConversationId);
      if (targetConversationId && messageConversationId !== targetConversationId) return false;
      if (message.id && normalizedIncoming.id && message.id === normalizedIncoming.id) return true;
      return (
        String(message.id || '').startsWith('temp-shop-') &&
        messageConversationId === incomingConversationId &&
        message.senderType === normalizedIncoming.senderType &&
        message.content === normalizedIncoming.content
      );
    });

    if (existingIndex >= 0) merged[existingIndex] = normalizedIncoming;
    else merged.push(normalizedIncoming);
  });

  return merged.sort((a, b) => {
    const left = new Date(a.createdAt || 0).getTime();
    const right = new Date(b.createdAt || 0).getTime();
    return sortDirection === 'asc' ? left - right : right - left;
  });
};



export function ChatProvider({ children }) {
  const { isAuthenticated, user } = useUser();


  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);


  const [userConversation, setUserConversation] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [userHasUnread, setUserHasUnread] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botMessages, setBotMessages] = useState([]);
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [latestProductSuggestions, setLatestProductSuggestions] = useState([]);

  const [hasNewChat, setHasNewChat] = useState(false);


  const activeConvIdRef = useRef(null);
  const isChatOpenRef = useRef(false);
  const subscribedConvIdsRef = useRef(new Set());
  const lastUserConvIdRef = useRef(null);
  const skipNextBotHistoryPersistRef = useRef(false);
  const skipNextBotSuggestionsPersistRef = useRef(false);

  const isStaff =
    isAuthenticated && ['ADMIN', 'EMPLOYEE'].includes(user?.roleName);
  const chatUserKey = isAuthenticated ? getChatUserKey(user) : null;
  const botStorageScope = chatUserKey || GUEST_BOT_STORAGE_SCOPE;
  const botHistoryKey = getScopedStorageKey(BOT_HISTORY_KEY_PREFIX, botStorageScope);
  const botSuggestionsKey = getScopedStorageKey(BOT_SUGGESTIONS_KEY_PREFIX, botStorageScope);
  const chatLastReadKey = getScopedStorageKey(CHAT_LAST_READ_KEY_PREFIX, chatUserKey);

  useEffect(() => {
    activeConvIdRef.current = activeConversation?.id || null;
  }, [activeConversation]);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  useEffect(() => {
    skipNextBotHistoryPersistRef.current = true;
    skipNextBotSuggestionsPersistRef.current = true;
    setUserConversation(null);
    setUserMessages([]);
    setUserHasUnread(false);
    setIsChatOpen(false);
    setBotMessages(botHistoryKey ? safeJsonParse(localStorage.getItem(botHistoryKey), []) : []);
    setLatestProductSuggestions(
      botSuggestionsKey ? safeJsonParse(localStorage.getItem(botSuggestionsKey), []) : [],
    );
    lastUserConvIdRef.current = null;
  }, [chatUserKey, botHistoryKey, botSuggestionsKey]);

  useEffect(() => {
    if (!botHistoryKey) return;
    if (skipNextBotHistoryPersistRef.current) {
      skipNextBotHistoryPersistRef.current = false;
      return;
    }
    localStorage.setItem(botHistoryKey, JSON.stringify(botMessages.slice(0, 50)));
  }, [botMessages, botHistoryKey]);

  useEffect(() => {
    if (!botSuggestionsKey) return;
    if (skipNextBotSuggestionsPersistRef.current) {
      skipNextBotSuggestionsPersistRef.current = false;
      return;
    }
    localStorage.setItem(botSuggestionsKey, JSON.stringify(latestProductSuggestions));
  }, [latestProductSuggestions, botSuggestionsKey]);


  useEffect(() => {
    if (!isAuthenticated) return;
    ChatSocketHelper.connect();
    return () => {
      ChatSocketHelper.disconnect();
    };
  }, [isAuthenticated]);




useEffect(() => {
  if (!isStaff || conversations.length === 0) return;

  conversations.forEach((conv) => {
    const topicConversationId = normalizeId(conv.id);
    if (!topicConversationId || subscribedConvIdsRef.current.has(topicConversationId)) return;

    ChatSocketHelper.subscribe(ApiUrl.CHAT_TOPIC(conv.id), (msg) => {

      const eventData = JSON.parse(msg.body);


      if (eventData.type === 'NEW_MESSAGE') {
        const newMessage = eventData.payload;
        const messageConversationId = getMessageConversationId(
          newMessage,
          topicConversationId,
        );
        const normalizedMessage = {
          ...newMessage,
          conversationId: newMessage.conversationId ?? messageConversationId,
        };
        const isActive = normalizeId(activeConvIdRef.current) === messageConversationId;
        const isOnChatPage = window.location.pathname.includes('/admin/chat-support');


        if (isActive && isOnChatPage) {
          setMessages((prev) =>
            mergeMessagesById(prev, [normalizedMessage], {
              conversationId: messageConversationId,
              sortDirection: 'asc',
            }),
          );
        }


        setConversations((prevOld) => {
          let newList = [...prevOld];
          const idx = newList.findIndex(
            (c) => normalizeId(c.id) === messageConversationId,
          );
          if (idx !== -1) {
            newList[idx] = {
              ...newList[idx],
              lastMessageText: normalizedMessage.content,
              lastMessageAt: normalizedMessage.createdAt,

              unread: (!isActive || !isOnChatPage) ? (newList[idx].unread || 0) + 1 : 0
            };

            return newList.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
          }
          return newList;
        });


        if (!isOnChatPage || !isActive) {
          setHasNewChat(true);
        }
      }
    });

    subscribedConvIdsRef.current.add(topicConversationId);
  });
}, [isStaff, conversations]);

  useEffect(() => {
    if (!isStaff) return;

    ChatSocketHelper.subscribe('/topic/admin/notifications', (msg) => {
      const eventData = JSON.parse(msg.body);
      if (eventData.type !== 'NEW_SUPPORT_MESSAGE') return;

      const isOnChatPage = window.location.pathname.includes('/admin/chat-support');
      const conversationId = normalizeId(eventData.conversationId);
      const isActive = normalizeId(activeConvIdRef.current) === conversationId;

      setConversations((previous) => {
        const index = previous.findIndex(
          (conversation) => normalizeId(conversation.id) === conversationId,
        );
        if (index === -1) {
          incrementStoredStaffUnread(conversationId);
          return previous;
        }
        if (subscribedConvIdsRef.current.has(conversationId)) return previous;

        const next = [...previous];
        next[index] = {
          ...next[index],
          lastMessageAt: eventData.createdAt || new Date().toISOString(),
          unread: isOnChatPage && isActive ? 0 : (next[index].unread || 0) + 1,
        };

        return next.sort(
          (a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0),
        );
      });

      if (!isOnChatPage) {
        setHasNewChat(true);
      }
    });
  }, [isStaff]);


  useEffect(() => {
    if (!isAuthenticated || !userConversation?.id) return;
    if (lastUserConvIdRef.current === userConversation.id) return;

    const convId = userConversation.id;

    ChatSocketHelper.subscribe(ApiUrl.CHAT_TOPIC(convId), async (msg) => {
      const eventData = JSON.parse(msg.body);
      const data = eventData.type === 'NEW_MESSAGE' ? eventData.payload : eventData;


      console.log('📨 Received message from WebSocket:', {
        senderType: data.senderType,
        senderName: data.senderName,
        senderId: data.senderId,
        content: data.content,
        createdAt: data.createdAt,
        chatChannel: data.chatChannel,
      });


      setUserMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return mergeMessagesById(prev, [data]);
      });


      try {
        const res = await ChatService.messages(convId, 0, 50);
        const page = res.data;
        const history = page.content || [];
        setUserMessages((prev) => mergeMessagesById(prev, history));
      } catch (err) {
        console.error('❌ Failed to refresh user messages:', err);
      }


      if (isChatOpenRef.current) {

        if (chatLastReadKey) {
          localStorage.setItem(chatLastReadKey, Date.now());
        }
        setUserHasUnread(false);
      } else {
        const lastRead = Number(
          chatLastReadKey ? localStorage.getItem(chatLastReadKey) || 0 : 0,
        );
        const createdAt = new Date(data.createdAt).getTime();
        if (createdAt > lastRead) {
          setUserHasUnread(true);
        }
      }
    });

    lastUserConvIdRef.current = convId;
  }, [isAuthenticated, userConversation, chatLastReadKey]);

 const sendMessage = async (conversationId, content, chatMode) => {
    if (!content.trim()) return;

    const targetConversationId = normalizeId(conversationId);
    if (!targetConversationId) return;

    const finalMode = chatMode || 'BOT';
    const isShopMessage = finalMode === 'SHOP';

    const tempMsg = {
      id: `temp-${Date.now()}`,
      conversationId: targetConversationId,
      content: content,
      senderType: isShopMessage && isStaff
        ? (user?.roleName || 'EMPLOYEE')
        : 'USER',
      senderName: user?.username || 'You',
      createdAt: new Date().toISOString(),
      chatChannel: finalMode,
    };

    if (isShopMessage) {
      const optimisticMessage = {
        ...tempMsg,
        id: `temp-shop-${Date.now()}`,
        senderType: isStaff ? (user?.roleName || 'EMPLOYEE') : 'USER',
      };

      if (isStaff) {
        if (normalizeId(activeConvIdRef.current) === targetConversationId) {
          setMessages((prev) =>
            mergeMessagesById(prev, [optimisticMessage], {
              conversationId: targetConversationId,
              sortDirection: 'asc',
            }),
          );
        }
      } else {
        setUserMessages((prev) =>
          mergeMessagesById(prev, [optimisticMessage], {
            conversationId: targetConversationId,
          }),
        );
      }
      ChatSocketHelper.sendMessage(targetConversationId, content, 'SHOP');



    } else {

      setBotMessages((prev) => [tempMsg, ...prev]);
      setIsBotLoading(true);

      try {
        const currentUserIdHex = user?.id ? user.id.toString(16) : "UNKNOWN";
        const res = await ChatService.botChat(targetConversationId, content, currentUserIdHex);

        const botReply = res.data?.data || res.data;
        const suggestions = Array.isArray(botReply?.products) && botReply.products.length
          ? botReply.products.map((product, index) => ({
              productName: product.name,
              slug: product.slug,
              order: index + 1,
            }))
          : extractProductSuggestions(botReply?.content || '');
        if (suggestions.length > 0) {
          setLatestProductSuggestions(suggestions);
        }


        setBotMessages((prev) => [botReply, ...prev]);
      } catch (err) {
        console.error('Bot API Error:', err);
        const status = err.response?.status;
        const serverMessage = err.response?.data?.message;
        const fallbackMessage =
          err.code === 'ECONNABORTED' || status === 408 || status === 504
            ? 'Trợ lý phản hồi hơi chậm. Bạn thử gửi lại câu hỏi ngắn hơn hoặc thử lại sau ít phút nhé.'
            : serverMessage || 'Hiện tại trợ lý đang phản hồi chậm. Bạn thử lại sau ít phút nhé, hoặc hỏi ngắn hơn để mình hỗ trợ nhanh hơn.';
        setBotMessages((prev) => [{
          id: `err-${Date.now()}`,
          content: fallbackMessage,
          senderType: 'BOT',
          senderName: 'Trendify Bot',
          createdAt: new Date().toISOString(),
          chatChannel: 'BOT'
        }, ...prev]);
      } finally {
        setIsBotLoading(false);
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{

        conversations,
        setConversations,
        activeConversation,
        setActiveConversation,
        messages,
        setMessages,
        sendMessage,
        hasNewChat,
        setHasNewChat,


        userConversation,
        setUserConversation,
        userMessages,
        setUserMessages,
        userHasUnread,
        setUserHasUnread,
        isChatOpen,
        setIsChatOpen,
        botMessages,
        setBotMessages,
        isBotLoading,
        latestProductSuggestions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);

const extractProductSuggestions = (content) => {
  const lines = String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line, index) => {
      const match = line.match(/(?:\*\*)?\[?([^\]\n]+?)\]?\(?http:\/\/localhost:3000\/user\/product\/detail\/([^) \n]+)\)?/i);
      if (!match) return null;
      return {
        productName: match[1].replace(/\*/g, '').trim(),
        slug: match[2],
        order: index + 1,
      };
    })
    .filter(Boolean)
    .slice(0, 10);
};
