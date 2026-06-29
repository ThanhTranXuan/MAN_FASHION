package com.manfashion.springboot_be.service.Chat;


import com.manfashion.springboot_be.DTO.Chat.*;
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
    private final ChatMapper chatMapper;

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
        ChatConversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));


        boolean isStaff = "EMPLOYEE".equalsIgnoreCase(senderType);
        ensureConversationAccess(conversation, senderId, isStaff);

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setSenderType(senderType);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        ChatMessage savedMessage = messageRepo.save(message);


        conversation.setLastMessageText(content);
        conversation.setLastMessageAt(savedMessage.getCreatedAt());
        conversationRepo.save(conversation);


        ChatMessageResponse responseDto = chatMapper.toMessageResponse(savedMessage);


        WsEventPayload wsPayload = new WsEventPayload("NEW_MESSAGE", responseDto);
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, wsPayload);
        if ("USER".equalsIgnoreCase(senderType)) {
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
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
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
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        ensureConversationAccess(conversation, userId, isStaff);
        log.info("Marked conversation {} as read for user {}", conversationId, userId);
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
