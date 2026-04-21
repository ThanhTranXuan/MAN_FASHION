import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ChatService = {
  // User: start or get conversation
  start: () => ApiClient.post(ApiUrl.CHAT_START).then(res=>{ return { data: res.data.data };}),

  me: () => ApiClient.get(ApiUrl.CHAT_ME).then(res=>{ return { data: res.data.data };}),

  // Messages: Page<ChatMessageResponse>
  // page = 0: newest chunk, size default 30
  messages: (id, page = 0, size = 30) =>
    ApiClient.get(ApiUrl.CHAT_MESSAGES(id), {
      params: { page, size },
    }).then(res=>{ return { data: res.data.data };}),

  // Admin: Page<ChatConversationSummary>
  allAdmin: (page = 0, size = 50) =>
    ApiClient.get(ApiUrl.CHAT_ALL_ADMIN, {
      params: { page, size },
    }).then(res=>{ return { data: res.data.data };}),
};

export default ChatService;
