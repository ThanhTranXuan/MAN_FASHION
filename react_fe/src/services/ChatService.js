import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ChatService = {
  // User: start or get conversation
  start: () => ApiClient.post(ApiUrl.CHAT_START),

  me: () => ApiClient.get(ApiUrl.CHAT_ME),

  // Messages: Page<ChatMessageResponse>
  // page = 0: newest chunk, size default 30
  messages: (id, page = 0, size = 30) =>
    ApiClient.get(ApiUrl.CHAT_MESSAGES(id), {
      params: { page, size },
    }),

  // Admin: Page<ChatConversationSummary>
  allAdmin: (page = 0, size = 50) =>
    ApiClient.get(ApiUrl.CHAT_ALL_ADMIN, {
      params: { page, size },
    }),
};

export default ChatService;
