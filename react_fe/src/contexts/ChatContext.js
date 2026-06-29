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

const mergeMessagesById = (currentMessages, incomingMessages) => {
  const merged = [...currentMessages];

  incomingMessages.forEach((incoming) => {
    if (!incoming) return;
    const existingIndex = merged.findIndex((message) => {
      if (message.id && incoming.id && message.id === incoming.id) return true;
      return (
        String(message.id || '').startsWith('temp-shop-') &&
        message.senderType === incoming.senderType &&
        message.content === incoming.content
      );
    });

    if (existingIndex >= 0) merged[existingIndex] = incoming;
    else merged.push(incoming);
  });

  return merged.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );
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
    if (subscribedConvIdsRef.current.has(conv.id)) return;

    ChatSocketHelper.subscribe(ApiUrl.CHAT_TOPIC(conv.id), (msg) => {

      const eventData = JSON.parse(msg.body);


      if (eventData.type === 'NEW_MESSAGE') {
        const newMessage = eventData.payload;
        const convId = conv.id;
        const isActive = activeConvIdRef.current === convId;
        const isOnChatPage = window.location.pathname.includes('/admin/chat-support');


        if (isActive && isOnChatPage) {
          setMessages((prev) => {

            if (prev.some(m => m.id === newMessage.id)) return prev;

            return [...prev, newMessage];
          });
        }


        setConversations((prevOld) => {
          let newList = [...prevOld];
          const idx = newList.findIndex((c) => c.id === convId);
          if (idx !== -1) {
            newList[idx] = {
              ...newList[idx],
              lastMessageText: newMessage.content,
              lastMessageAt: newMessage.createdAt,

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

    subscribedConvIdsRef.current.add(conv.id);
  });
}, [isStaff, conversations]);

  useEffect(() => {
    if (!isStaff) return;

    ChatSocketHelper.subscribe('/topic/admin/notifications', (msg) => {
      const eventData = JSON.parse(msg.body);
      if (eventData.type !== 'NEW_SUPPORT_MESSAGE') return;

      const isOnChatPage = window.location.pathname.includes('/admin/chat-support');
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

    const finalMode = chatMode || 'BOT';
    const isShopMessage = finalMode === 'SHOP';

    const tempMsg = {
      id: `temp-${Date.now()}`,
      content: content,
      senderType: isShopMessage && isStaff
        ? (user?.roleName || 'EMPLOYEE')
        : 'USER',
      senderName: user?.username || 'You',
      createdAt: new Date().toISOString(),
      chatChannel: finalMode,
    };

    if (isShopMessage) {
      if (!isStaff) {
        setUserMessages((prev) =>
          mergeMessagesById(prev, [
            {
              ...tempMsg,
              id: `temp-shop-${Date.now()}`,
            },
          ]),
        );
      }
      ChatSocketHelper.sendMessage(conversationId, content, 'SHOP');



    } else {

      setBotMessages((prev) => [tempMsg, ...prev]);
      setIsBotLoading(true);

      try {
        const currentUserIdHex = user?.id ? user.id.toString(16) : "UNKNOWN";
        const res = await ChatService.botChat(conversationId, content, currentUserIdHex);

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
