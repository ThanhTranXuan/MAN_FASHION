package com.manfashion.springboot_be.controller.Chat;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Chat.*;

import com.manfashion.springboot_be.entity.ChatConversation;
import com.manfashion.springboot_be.mapper.ChatMapper;
import com.manfashion.springboot_be.service.Chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final ChatMapper chatMapper;



    private Integer getCurrentUserId() {
        var context = SecurityContextHolder.getContext();
        if (context == null || context.getAuthentication() == null) {
            throw new RuntimeException("❌ No authentication in SecurityContext");
        }

        String principal = (String) context.getAuthentication().getPrincipal();
        try {

            return Integer.valueOf(principal);
        } catch (NumberFormatException e) {
            throw new RuntimeException("❌ Invalid Integer ID in token: " + principal);
        }
    }

    private boolean isStaff(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(r -> r.getAuthority().equals("ADMIN") || r.getAuthority().equals("EMPLOYEE"));
    }

    @PostMapping("/start")
    public ApiResponse<ChatConversationSummary> start() {
        Integer userId = getCurrentUserId();
        ChatConversation conversation = chatService.getOrCreateConversation(userId);
        return ApiResponse.<ChatConversationSummary>builder()
                .message("chat.start.success")
                .data(chatMapper.toSummary(conversation))
                .build();
    }


    @GetMapping("/me")
    public ApiResponse<ChatConversationSummary> getMyConversation() {
        Integer userId = getCurrentUserId();
        ChatConversation conversation = chatService.getOrCreateConversation(userId);
        return ApiResponse.<ChatConversationSummary>builder()
                .message("chat.get_my.success")
                .data(chatMapper.toSummary(conversation))
                .build();
    }


    @GetMapping("/{conversationId}/messages")
    public ApiResponse<Page<ChatMessageResponse>> getMessages(
            @PathVariable Integer conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            Authentication auth
    ) {
        Integer userId = getCurrentUserId();
        return ApiResponse.<Page<ChatMessageResponse>>builder()
                .message("chat.get_messages.success")
                .data(chatService.getMessagesPaged(conversationId, userId, isStaff(auth), page, size))
                .build();
    }


    @GetMapping("/admin/conversations")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<Page<ChatConversationSummary>> getAllForStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<Page<ChatConversationSummary>>builder()
                .message("chat.get_conversations.success")
                .data(chatService.getAllConversationsForStaffPaged(page, size))
                .build();
    }


    @PostMapping("/send")
    public ApiResponse<ChatMessageResponse> sendMessageREST(
            @RequestBody ChatMessageRequest req,
            Authentication auth
    ) {
        Integer senderId = getCurrentUserId();


        String senderType = isStaff(auth) ? "EMPLOYEE" : "USER";

        ChatMessageResponse savedMessage = chatService.processAndBroadcastMessage(
                Integer.valueOf(req.getConversationId()),
                senderId,
                senderType,
                req.getContent()
        );

        return ApiResponse.<ChatMessageResponse>builder()
                .message("Tin nhắn đã gửi")
                .data(savedMessage)
                .build();
    }


    @PutMapping("/mark-read")
    public ApiResponse<Map<String, Boolean>> markRead(@RequestBody MarkReadRequest req, Authentication auth) {
        Integer userId = getCurrentUserId();
        chatService.markConversationAsRead(req.getConversationId(), userId, isStaff(auth));
        return ApiResponse.<Map<String, Boolean>>builder()
                .message("Đã cập nhật trạng thái đọc")
                .data(Map.of("success", true))
                .build();
    }


    @MessageMapping("/chat/send")
    public void handleWebSocketMessage(@Payload ChatMessageRequest req, Authentication auth) {

        Integer senderId = Integer.valueOf((String) auth.getPrincipal());


        String senderType = isStaff(auth) ? "EMPLOYEE" : "USER";



        chatService.processAndBroadcastMessage(
                Integer.valueOf(req.getConversationId()),
                senderId,
                senderType,
                req.getContent()
        );
    }

}
