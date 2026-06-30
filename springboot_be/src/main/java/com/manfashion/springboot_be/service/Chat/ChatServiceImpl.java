package com.manfashion.springboot_be.service.Chat;

import com.manfashion.springboot_be.DTO.Chat.ChatConversationSummary;
import com.manfashion.springboot_be.DTO.Chat.ChatMessageResponse;
import com.manfashion.springboot_be.DTO.Chat.WsEventPayload;
import com.manfashion.springboot_be.entity.ChatConversation;
import com.manfashion.springboot_be.entity.ChatMessage;
import com.manfashion.springboot_be.entity.User;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.ChatMapper;
import com.manfashion.springboot_be.repository.Chat.ChatConversationRepository;
import com.manfashion.springboot_be.repository.Chat.ChatMessageRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ChatConversationRepository conversationRepo;
    private final ChatMessageRepository messageRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final ChatMapper chatMapper;

    @Override
    @Transactional
    public ChatConversation getOrCreateConversation(Integer userId) {
        return conversationRepo.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

                    ChatConversation newConv = new ChatConversation();
                    newConv.setUser(user);
                    newConv.setStatus("OPEN");
                    return conversationRepo.save(newConv);
                });
    }

    @Override
    @Transactional
    public ChatMessageResponse processAndBroadcastMessage(
            Integer conversationId,
            Integer senderId,
            String senderType,
            String content
    ) {
        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isBlank()) {
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống.");
        }

        String normalizedSenderType = normalizeSenderType(senderType);
        boolean isStaff = "EMPLOYEE".equalsIgnoreCase(normalizedSenderType)
                || "ADMIN".equalsIgnoreCase(normalizedSenderType);

        ChatConversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện."));

        if (senderId == null) {
            throw new IllegalArgumentException("Không xác định được người gửi tin nhắn.");
        }

        ensureConversationAccess(conversation, senderId, isStaff);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Người gửi không tồn tại."));

        log.debug(
                "Saving chat message: conversationId={}, senderType={}, senderId={}, content={}",
                conversationId,
                normalizedSenderType,
                senderId,
                normalizedContent
        );

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setSenderType(normalizedSenderType);
        message.setContent(normalizedContent);
        message.setCreatedAt(LocalDateTime.now());
        ChatMessage savedMessage = messageRepo.save(message);

        conversation.setLastMessageText(normalizedContent);
        conversation.setLastMessageAt(savedMessage.getCreatedAt());
        conversationRepo.save(conversation);

        ChatMessageResponse responseDto = chatMapper.toMessageResponse(savedMessage);

        log.debug(
                "Broadcasting chat message: conversationId={}, messageId={}, content={}",
                conversationId,
                responseDto.getId(),
                responseDto.getContent()
        );

        WsEventPayload wsPayload = new WsEventPayload("NEW_MESSAGE", responseDto);
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, wsPayload);
        if ("USER".equalsIgnoreCase(normalizedSenderType)) {
            messagingTemplate.convertAndSend("/topic/admin/notifications", (Object) Map.of(
                    "type", "NEW_SUPPORT_MESSAGE",
                    "conversationId", conversationId,
                    "senderId", senderId,
                    "createdAt", LocalDateTime.now().toString()
            ));
        }

        return responseDto;
    }

    @Override
    public Page<ChatMessageResponse> getMessagesPaged(Integer conversationId, Integer currentUserId, boolean isStaff, int page, int size) {
        ChatConversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện."));
        ensureConversationAccess(conversation, currentUserId, isStaff);

        Pageable pageable = PageRequest.of(page, Math.min(Math.max(size, 1), 50));
        Page<ChatMessage> messagePage = messageRepo.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);

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
    public void markConversationAsRead(Integer conversationId, Integer userId, boolean isStaff) {
        ChatConversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện."));
        ensureConversationAccess(conversation, userId, isStaff);
        log.info("Marked conversation {} as read for user {}", conversationId, userId);
    }

    private String normalizeSenderType(String senderType) {
        if (senderType == null || senderType.isBlank()) {
            return "USER";
        }
        return senderType.trim().toUpperCase();
    }

    private void ensureConversationAccess(ChatConversation conversation, Integer userId, boolean isStaff) {
        if (isStaff) {
            return;
        }

        Integer ownerId = conversation.getUser() != null ? conversation.getUser().getId() : null;
        if (ownerId == null || !ownerId.equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }
}
