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

  // ====== ADMIN BADGE ======
  const [hasNewChat, setHasNewChat] = useState(false);

  // ====== REFS ======
  const activeConvIdRef = useRef(null);
  const isChatOpenRef = useRef(false);
  const subscribedConvIdsRef = useRef(new Set());
  const lastUserConvIdRef = useRef(null);

  const isStaff =
    isAuthenticated && ['ADMIN', 'EMPLOYEE'].includes(user?.roleName);

  useEffect(() => {
    activeConvIdRef.current = activeConversation?.id || null;
  }, [activeConversation]);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

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
      const data = JSON.parse(msg.body);
      
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
      setUserMessages((prev) => [...prev, data]);

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
        localStorage.setItem('chat:lastReadAt', Date.now());
        setUserHasUnread(false);
      } else {
        const lastRead = Number(localStorage.getItem('chat:lastReadAt') || 0);
        const createdAt = new Date(data.createdAt).getTime();
        if (createdAt > lastRead) {
          setUserHasUnread(true);
        }
      }
    });

    lastUserConvIdRef.current = convId;
  }, [isAuthenticated, userConversation]);

  // ====== SEND MESSAGE (COMMON) ======
  const sendMessage = (conversationId, content, chatMode = 'BOT') => {
    ChatSocketHelper.sendMessage(conversationId, content, chatMode);
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
