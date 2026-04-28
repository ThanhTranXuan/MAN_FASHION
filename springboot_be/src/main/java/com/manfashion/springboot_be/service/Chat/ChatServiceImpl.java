package com.manfashion.springboot_be.service.Chat;


import com.manfashion.springboot_be.DTO.Chat.*;
import com.manfashion.springboot_be.entity.ChatConversation;
import com.manfashion.springboot_be.entity.ChatMessage;
import com.manfashion.springboot_be.entity.User;
import com.manfashion.springboot_be.mapper.ChatMapper;
import com.manfashion.springboot_be.repository.Chat.ChatConversationRepository;
import com.manfashion.springboot_be.repository.Chat.ChatMessageRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ChatConversationRepository conversationRepo;
    private final ChatMessageRepository messageRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final ChatMapper chatMapper; // Inject thêm Mapper

    @Override
    @Transactional
    public ChatConversation getOrCreateConversation(Integer userId) {
        return conversationRepo.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + userId));

                    ChatConversation newConv = new ChatConversation();
                    newConv.setUser(user);
                    newConv.setStatus("OPEN");
                    return conversationRepo.save(newConv);
                });
    }

    @Override
    @Transactional
    public ChatMessageResponse processAndBroadcastMessage(Integer conversationId, Integer senderId, String senderType, String content) {
        ChatConversation conversation = conversationRepo.getReferenceById(conversationId);
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 1. Lưu tin nhắn vào MySQL
        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setSenderType(senderType);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        ChatMessage savedMessage = messageRepo.save(message);

        // 2. CẬP NHẬT PHÒNG CHAT (Rất quan trọng để Sort cho Admin)
        conversation.setLastMessageText(content);
        conversation.setLastMessageAt(savedMessage.getCreatedAt());
        conversationRepo.save(conversation);

        // 3. Dùng chung Mapper để WebSocket trả về DTO y hệt như gọi API GET /messages
        ChatMessageResponse responseDto = chatMapper.toMessageResponse(savedMessage);

        // 4. Bắn qua WebSocket
        WsEventPayload wsPayload = new WsEventPayload("NEW_MESSAGE", responseDto);
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, wsPayload);

        // 5. Trả về cho API POST
        // (Lưu ý: API POST của bạn đang khai báo trả về MessageDetailResponse,
        // bạn nên đổi return type của Controller/Service thành ChatMessageResponse luôn cho đồng nhất toàn hệ thống).
        return responseDto;
    }

    @Override
    public Page<ChatMessageResponse> getMessagesPaged(Integer conversationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messagePage = messageRepo.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);

        // Map Page<Entity> -> Page<DTO>
        return messagePage.map(chatMapper::toMessageResponse);
    }

    @Override
    public Page<ChatConversationSummary> getAllConversationsForStaffPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatConversation> conversationPage = conversationRepo.findAllByOrderByLastMessageAtDesc(pageable);

        return conversationPage.map(chatMapper::toSummary);
    }

    @Override
    @Transactional
    public void markConversationAsRead(Integer conversationId, Integer userId) {
        // Thực thi logic đánh dấu đã đọc (Ví dụ: Update status các message của người khác thành READ)
        // Hiện tại có thể để trống hoặc thêm query vào Repository sau
        log.info("Marked conversation {} as read for user {}", conversationId, userId);
    }
}
