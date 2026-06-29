
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AuthService from 'services/AuthService';
import ApiUrl from 'constants/ApiUrl';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

let stompClient = null;
let pendingSubscriptions = [];
const subscribedTopics = new Map();

function connect() {
  if (stompClient && stompClient.active) {
    return;
  }
  const token = AuthService.getAccessToken();
  stompClient = new Client({
    reconnectDelay: 3000,
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  stompClient.onConnect = () => {
    console.log('🟢 Chat WebSocket connected');
    const existingSubscriptions = Array.from(subscribedTopics.entries());
    existingSubscriptions.forEach(([topic, callback]) => {
      stompClient.subscribe(topic, callback);
    });


    const queued = pendingSubscriptions;
    pendingSubscriptions = [];
    queued.forEach(({ topic, callback }) => {
      if (!subscribedTopics.has(topic)) {
        stompClient.subscribe(topic, callback);
        subscribedTopics.set(topic, callback);
      }
    });
  };

  stompClient.onStompError = (frame) => {
    console.error('❌ STOMP error', frame.headers?.message || frame);
  };

  stompClient.onWebSocketClose = () => {
    console.log('🔌 Chat WebSocket disconnected');

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
  if (
    subscribedTopics.has(topic) ||
    pendingSubscriptions.some((item) => item.topic === topic)
  ) {
    return;
  }

  if (!stompClient || !stompClient.active) {

    if (!stompClient) {
      connect();
    }
    pendingSubscriptions.push({ topic, callback });
  } else if (!stompClient.connected) {

    pendingSubscriptions.push({ topic, callback });
  } else {

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


const ChatSocketHelper = {
  connect,
  disconnect,
  subscribe,
  sendMessage,
};

export default ChatSocketHelper;
