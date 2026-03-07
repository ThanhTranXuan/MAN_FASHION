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

const ADMIN_LAST_VISIT_KEY = 'chat:adminLastVisit';

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

  // ====== ADMIN: LOAD CONVERSATIONS + OFFLINE BADGE ======
  useEffect(() => {
    if (!isStaff) return;

    const lastVisit = Number(localStorage.getItem(ADMIN_LAST_VISIT_KEY) || 0);

    const fetchConversations = async () => {
      try {
        const res = await ChatService.allAdmin(0, 50);
        const page = res.data;
        const list = (page.content || []).map((c) => ({
          ...c,
          unread: 0,
        }));
        setConversations(list);

        const anyNew = list.some(
          (c) =>
            c.lastMessageAt &&
            new Date(c.lastMessageAt).getTime() > lastVisit,
        );
        if (anyNew) setHasNewChat(true);
      } catch (e) {
        console.error('❌ Failed to load admin conversations:', e);
      }
    };

    fetchConversations();
  }, [isStaff]);

  // ====== ADMIN: SUBSCRIBE MỖI CONVERSATION ======
  useEffect(() => {
    if (!isStaff) return;

    conversations.forEach((conv) => {
      if (subscribedConvIdsRef.current.has(conv.id)) return;

      ChatSocketHelper.subscribe(ApiUrl.CHAT_TOPIC(conv.id), async (msg) => {
        const data = JSON.parse(msg.body);
        const convId = conv.id;
        const isActive = activeConvIdRef.current === convId;
        const isOnChatPage = window.location.pathname.includes('/admin/chat-support');

        // Nếu đang đứng trong phòng đó + ở trang chat → update messages ngay
        if (isActive && isOnChatPage) {
          setMessages((prev) => [...prev, data]);
        }

        // Refresh danh sách phòng từ API (silent, page 0)
        try {
          const res = await ChatService.allAdmin(0, 50);
          const page = res.data;
          const freshListRaw = page.content || [];

          setConversations((prevOld) => {
            const unreadById = new Map(
              prevOld.map((c) => [c.id, c.unread || 0]),
            );

            const fresh = freshListRaw.map((c) => ({
              ...c,
              unread: unreadById.get(c.id) || 0,
            }));

            const idx = fresh.findIndex((c) => c.id === convId);
            if (idx !== -1) {
              if (!isActive || !isOnChatPage) {
                fresh[idx].unread = (fresh[idx].unread || 0) + 1;
              } else {
                fresh[idx].unread = 0;
              }
            }

            return fresh.sort(
              (a, b) =>
                new Date(b.lastMessageAt || 0) -
                new Date(a.lastMessageAt || 0),
            );
          });
        } catch (err) {
          console.error('❌ Failed to refresh conversations:', err);
        }

        // Nếu không đứng trong phòng hoặc không ở trang chat → bật badge sidebar
        if (!isOnChatPage || !isActive) {
          setHasNewChat(true);
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
  const sendMessage = (conversationId, content) => {
    ChatSocketHelper.sendMessage(conversationId, content);
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
