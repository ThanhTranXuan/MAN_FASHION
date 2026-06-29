import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ChatService = {

  start: () => ApiClient.post(ApiUrl.CHAT_START).then(res=>{ return { data: res.data.data };}),

  me: () => ApiClient.get(ApiUrl.CHAT_ME).then(res=>{ return { data: res.data.data };}),



  messages: (id, page = 0, size = 30) =>
    ApiClient.get(ApiUrl.CHAT_MESSAGES(id), {
      params: { page, size },
    }).then(res=>{ return { data: res.data.data };}),


  allAdmin: (page = 0, size = 50) =>
    ApiClient.get(ApiUrl.CHAT_ALL_ADMIN, {
      params: { page, size },
    }).then(res=>{ return { data: res.data.data };}),

    botChat: (conversationId, message, userIdHex = "UNKNOWN") =>
    ApiClient.post(`/api/v1/bot/chat/${conversationId}`,
      { message },
      {
        headers: { 'X-User-Id-Hex': userIdHex },
        timeout: 70000,
      }
    ).then(res => { return { data: res.data }; }),
};

export default ChatService;
