package com.manfashion.springboot_be.service.Chat;

import com.manfashion.springboot_be.DTO.Chat.ChatConversationSummary;
import com.manfashion.springboot_be.DTO.Chat.ChatMessageRequest;
import com.manfashion.springboot_be.DTO.Chat.ChatMessageResponse;
import com.manfashion.springboot_be.DTO.Chat.MessageDetailResponse;
import com.manfashion.springboot_be.entity.ChatConversation;
import org.springframework.data.domain.Page;

public interface ChatService {
    ChatConversation getOrCreateConversation(Integer userId);

    // Đã sửa lại kiểu trả về để phục vụ API POST /send
    ChatMessageResponse processAndBroadcastMessage(Integer conversationId, Integer senderId, String senderType, String content);

    // Các hàm phân trang mới
    Page<ChatMessageResponse> getMessagesPaged(Integer conversationId, Integer currentUserId, boolean isStaff, int page, int size);
    Page<ChatConversationSummary> getAllConversationsForStaffPaged(int page, int size);

    void markConversationAsRead(Integer conversationId, Integer userId, boolean isStaff);

}
