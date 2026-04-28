// src/utils/ChatSocketHelper.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AuthService from 'services/AuthService';
import ApiUrl from 'constants/ApiUrl';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

let stompClient = null;
let pendingSubscriptions = [];
const subscribedTopics = new Map(); // Map<topic, callback>

function connect() {
  if (stompClient && stompClient.active) {
    return; // already connecting/connected
  }
  const token = AuthService.getAccessToken();
  stompClient = new Client({
    reconnectDelay: 3000,
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  stompClient.onConnect = () => {
    console.log('🟢 Chat WebSocket connected');
    // Subscribe any pending topics that were registered before connection
    pendingSubscriptions.forEach(({ topic, callback }) => {
      stompClient.subscribe(topic, callback);
      subscribedTopics.set(topic, callback);
    });
    pendingSubscriptions = [];
    // Re-subscribe to existing topics on reconnect
    subscribedTopics.forEach((callback, topic) => {
      stompClient.subscribe(topic, callback);
    });
  };

  stompClient.onStompError = (frame) => {
    console.error('❌ STOMP error', frame.headers?.message || frame);
  };

  stompClient.onWebSocketClose = () => {
    console.log('🔌 Chat WebSocket disconnected');
    // auto-reconnect nhờ reconnectDelay, không cần làm gì thêm
  };

  stompClient.activate();
}

function disconnect() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    pendingSubscriptions = [];
    subscribedTopics.clear();
  }
}

function subscribe(topic, callback) {
  if (!stompClient || !stompClient.active) {
    // Not connected yet – ensure connection is started and queue the subscription
    if (!stompClient) {
      connect();
    }
    pendingSubscriptions.push({ topic, callback });
  } else if (!stompClient.connected) {
    // Connection in progress – queue the subscription
    pendingSubscriptions.push({ topic, callback });
  } else {
    // Already connected – subscribe immediately
    stompClient.subscribe(topic, callback);
    subscribedTopics.set(topic, callback);
  }
}

function sendMessage(conversationId, content, chatMode = 'BOT') {
  console.log('📤 sendMessage:', { conversationId, content, chatMode });
  
  if (!stompClient || !stompClient.connected || !content.trim()) {
    console.warn('❌ Cannot send - check connection:', {
      hasClient: !!stompClient,
      isConnected: stompClient?.connected,
      hasContent: !!content?.trim(),
    });
    return;
  }
  
  try {
    stompClient.publish({
      destination: ApiUrl.CHAT_SEND_WS,
      body: JSON.stringify({ conversationId, content, chatMode }),
    });
    console.log('✅ Message published via STOMP');
  } catch (err) {
    console.error('❌ STOMP publish failed:', err);
  }
}

// 👉 Gán object vào biến trước rồi mới export default để hết warning ESLint
const ChatSocketHelper = {
  connect,
  disconnect,
  subscribe,
  sendMessage,
};

export default ChatSocketHelper;
