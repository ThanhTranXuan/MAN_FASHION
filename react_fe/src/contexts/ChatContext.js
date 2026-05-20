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
const BOT_HISTORY_KEY_PREFIX = 'trendify:botMessages';
const BOT_SUGGESTIONS_KEY_PREFIX = 'trendify:latestProductSuggestions';
const CHAT_LAST_READ_KEY_PREFIX = 'chat:lastReadAt';

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

// const ADMIN_LAST_VISIT_KEY = 'chat:adminLastVisit';

export function ChatProvider({ children }) {
  const { isAuthenticated, user } = useUser();

  // ====== ADMIN / STAFF ======
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // ====== USER WIDGET ======
  const [userConversation, setUserConversation] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [userHasUnread, setUserHasUnread] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // user popup open/close
  const [botMessages, setBotMessages] = useState([]);
  const [latestProductSuggestions, setLatestProductSuggestions] = useState([]);
  // ====== ADMIN BADGE ======
  const [hasNewChat, setHasNewChat] = useState(false);

  // ====== REFS ======
  const activeConvIdRef = useRef(null);
  const isChatOpenRef = useRef(false);
  const subscribedConvIdsRef = useRef(new Set());
  const lastUserConvIdRef = useRef(null);
  const currentChatUserKeyRef = useRef(null);

  const isStaff =
    isAuthenticated && ['ADMIN', 'EMPLOYEE'].includes(user?.roleName);
  const chatUserKey = isAuthenticated && !isStaff ? getChatUserKey(user) : null;
  const botHistoryKey = getScopedStorageKey(BOT_HISTORY_KEY_PREFIX, chatUserKey);
  const botSuggestionsKey = getScopedStorageKey(BOT_SUGGESTIONS_KEY_PREFIX, chatUserKey);
  const chatLastReadKey = getScopedStorageKey(CHAT_LAST_READ_KEY_PREFIX, chatUserKey);

  useEffect(() => {
    activeConvIdRef.current = activeConversation?.id || null;
  }, [activeConversation]);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  useEffect(() => {
    currentChatUserKeyRef.current = chatUserKey;
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
    if (!botHistoryKey || currentChatUserKeyRef.current !== chatUserKey) return;
    localStorage.setItem(botHistoryKey, JSON.stringify(botMessages.slice(0, 50)));
  }, [botMessages, botHistoryKey, chatUserKey]);

  useEffect(() => {
    if (!botSuggestionsKey || currentChatUserKeyRef.current !== chatUserKey) return;
    localStorage.setItem(botSuggestionsKey, JSON.stringify(latestProductSuggestions));
  }, [latestProductSuggestions, botSuggestionsKey, chatUserKey]);

  // ====== CONNECT WS ======
  useEffect(() => {
    if (!isAuthenticated) return;
    ChatSocketHelper.connect();
    return () => {
      ChatSocketHelper.disconnect();
    };
  }, [isAuthenticated]);

    // File: ChatContext.js

// ====== ADMIN: SUBSCRIBE MỖI CONVERSATION ======
useEffect(() => {
  if (!isStaff || conversations.length === 0) return;

  conversations.forEach((conv) => {
    if (subscribedConvIdsRef.current.has(conv.id)) return;

    ChatSocketHelper.subscribe(ApiUrl.CHAT_TOPIC(conv.id), (msg) => {
      // 1. Nhận gói tin từ Backend
      const eventData = JSON.parse(msg.body);
      
      // 2. Kiểm tra đúng loại sự kiện và BÓC PAYLOAD (Bức thư nằm trong phong bì)
      if (eventData.type === 'NEW_MESSAGE') {
        const newMessage = eventData.payload; // Đây mới là dữ liệu ChatMessageResponse thực sự
        const convId = conv.id;
        const isActive = activeConvIdRef.current === convId;
        const isOnChatPage = window.location.pathname.includes('/admin/chat-support');

        // ✅ Cập nhật KHUNG CHAT đang mở
        if (isActive && isOnChatPage) {
          setMessages((prev) => {
            // Chống trùng (đề phòng Admin nhắn tin, API và WS cùng về)
            if (prev.some(m => m.id === newMessage.id)) return prev;
            // Admin dùng mảng ASC (cũ trên, mới dưới) -> Append vào cuối
            return [...prev, newMessage];
          });
        }

        // ✅ Cập nhật SIDEBAR (Tin nhắn cuối) - KHÔNG GỌI API REFRESH
        setConversations((prevOld) => {
          let newList = [...prevOld];
          const idx = newList.findIndex((c) => c.id === convId);
          if (idx !== -1) {
            newList[idx] = {
              ...newList[idx],
              lastMessageText: newMessage.content,
              lastMessageAt: newMessage.createdAt,
              // Tăng số chưa đọc nếu Admin đang ở phòng khác
              unread: (!isActive || !isOnChatPage) ? (newList[idx].unread || 0) + 1 : 0
            };
            // Sắp xếp lại danh sách phòng: Mới nhất lên đầu
            return newList.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
          }
          return newList;
        });

        // 3. Thông báo chung cho Admin
        if (!isOnChatPage || !isActive) {
          setHasNewChat(true);
        }
      }
    });

    subscribedConvIdsRef.current.add(conv.id);
  });
}, [isStaff, conversations]);

  // ====== USER: SUBSCRIBE CONVERSATION CỦA USER ======
  useEffect(() => {
    if (!isAuthenticated || !userConversation?.id) return;
    if (lastUserConvIdRef.current === userConversation.id) return;

    const convId = userConversation.id;

    ChatSocketHelper.subscribe(ApiUrl.CHAT_TOPIC(convId), async (msg) => {
      const eventData = JSON.parse(msg.body);
      const data = eventData.type === 'NEW_MESSAGE' ? eventData.payload : eventData;
      
      // ✅ DEBUG: Log incoming message structure
      console.log('📨 Received message from WebSocket:', {
        senderType: data.senderType,
        senderName: data.senderName,
        senderId: data.senderId,
        content: data.content,
        createdAt: data.createdAt,
        chatChannel: data.chatChannel,
      });

      // 1. Optimistic update → tin mới hiện ngay ở dưới cùng
      setUserMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });

      // 2. Silent refresh history từ API (page 0)
      try {
        const res = await ChatService.messages(convId, 0, 50);
        const page = res.data;
        setUserMessages(page.content || []);
      } catch (err) {
        console.error('❌ Failed to refresh user messages:', err);
      }

      // 3. Badge ở floating button
      if (isChatOpenRef.current) {
        // Nếu popup đang mở → coi như đã đọc
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

    const finalMode = isStaff ? 'SHOP' : (chatMode || 'BOT');

    const tempMsg = {
      id: `temp-${Date.now()}`,
      content: content,
      senderType: isStaff ? (user?.roleName || 'EMPLOYEE') : 'USER',
      senderName: user?.username || 'You',
      createdAt: new Date().toISOString(),
      chatChannel: finalMode,
    };

    if (finalMode === 'SHOP') {
      ChatSocketHelper.sendMessage(conversationId, content, 'SHOP');
      // KHÔNG CẦN OPTIMISTIC UI NỮA:
      // WebSocket server sẽ echo lại message (cùng ID thật).
      // Khi nhận được message từ WS, state messages/userMessages sẽ tự động được append.
    } else {
      const contextHint = latestProductSuggestions.length
        ? `\n\nNgữ cảnh sản phẩm đã gợi ý gần nhất: ${JSON.stringify(latestProductSuggestions)}`
        : '';
      const messageWithContext = `${content}${contextHint}`;
      // LUỒNG BOT: Lưu vào ngăn kéo botMessages
      setBotMessages((prev) => [tempMsg, ...prev]); 

      try {
        const currentUserIdHex = user?.id ? user.id.toString(16) : "UNKNOWN";
        const res = await ChatService.botChat(conversationId, messageWithContext, currentUserIdHex);
        
        const botReply = res.data?.data || res.data;
        const suggestions = extractProductSuggestions(botReply?.content || '');
        if (suggestions.length > 0) {
          setLatestProductSuggestions(suggestions);
        }
        
        // LUỒNG BOT: Trả lời cũng lưu vào ngăn kéo botMessages
        setBotMessages((prev) => [botReply, ...prev]);
      } catch (err) {
        console.error('Bot API Error:', err);
        setBotMessages((prev) => [...prev, { // Lỗi cũng hiển thị ở tab Bot
          id: `err-${Date.now()}`,
          content: 'Không thể gửi tin nhắn. Vui lòng thử lại.',
          senderType: 'BOT',
          senderName: 'Trendify Bot',
          createdAt: new Date().toISOString(),
          chatChannel: 'BOT'
        }]);
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        // admin
        conversations,
        setConversations,
        activeConversation,
        setActiveConversation,
        messages,
        setMessages,
        sendMessage,
        hasNewChat,
        setHasNewChat,

        // user widget
        userConversation,
        setUserConversation,
        userMessages,
        setUserMessages,
        userHasUnread,
        setUserHasUnread,
        isChatOpen,
        setIsChatOpen,
        botMessages,         // THÊM DÒNG NÀY
        setBotMessages,
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
