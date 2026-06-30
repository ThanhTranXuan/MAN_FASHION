package com.manfashion.springboot_be.controller.Chat;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Chat.ChatConversationSummary;
import com.manfashion.springboot_be.DTO.Chat.ChatMessageRequest;
import com.manfashion.springboot_be.DTO.Chat.ChatMessageResponse;
import com.manfashion.springboot_be.DTO.Chat.MarkReadRequest;
import com.manfashion.springboot_be.entity.ChatConversation;
import com.manfashion.springboot_be.mapper.ChatMapper;
import com.manfashion.springboot_be.repository.User.UserRepository;
import com.manfashion.springboot_be.service.Chat.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final ChatMapper chatMapper;
    private final UserRepository userRepository;

    private Integer getCurrentUserId() {
        var context = SecurityContextHolder.getContext();
        if (context == null || context.getAuthentication() == null) {
            throw new RuntimeException("Không xác định được người dùng hiện tại.");
        }

        Integer userId = parseIntegerSafe(getPrincipalAsString(context.getAuthentication()));
        if (userId == null) {
            throw new RuntimeException("Không xác định được người dùng hiện tại.");
        }
        return userId;
    }

    private boolean isStaff(Authentication auth) {
        return auth != null && auth.getAuthorities() != null && auth.getAuthorities().stream()
                .anyMatch(r -> r.getAuthority().equals("ADMIN") || r.getAuthority().equals("EMPLOYEE"));
    }

    private Authentication resolveAuthentication(Authentication auth) {
        return auth != null ? auth : SecurityContextHolder.getContext().getAuthentication();
    }

    private String getSenderType(Authentication auth, Integer userId) {
        Authentication resolvedAuth = resolveAuthentication(auth);
        boolean isAdmin = resolvedAuth != null && resolvedAuth.getAuthorities() != null
                && resolvedAuth.getAuthorities().stream().anyMatch(r -> r.getAuthority().equals("ADMIN"));
        if (isAdmin) return "ADMIN";

        boolean isEmployee = resolvedAuth != null && resolvedAuth.getAuthorities() != null
                && resolvedAuth.getAuthorities().stream().anyMatch(r -> r.getAuthority().equals("EMPLOYEE"));
        if (isEmployee) return "EMPLOYEE";

        boolean isGuest = resolvedAuth == null
                || "guest".equalsIgnoreCase(getPrincipalAsString(resolvedAuth))
                || (resolvedAuth.getAuthorities() != null && resolvedAuth.getAuthorities().stream()
                .anyMatch(r -> r.getAuthority().equals("GUEST")));
        if (isGuest || userId == null) return "GUEST";

        return userRepository.findRoleNameByUserId(userId)
                .filter(role -> role.equals("ADMIN") || role.equals("EMPLOYEE"))
                .orElse("USER");
    }

    private Integer parseIntegerSafe(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Integer.valueOf(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String getPrincipalAsString(Authentication auth) {
        return auth != null && auth.getPrincipal() != null
                ? String.valueOf(auth.getPrincipal())
                : null;
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
        Integer conversationId = parseIntegerSafe(req.getConversationId());
        if (conversationId == null) {
            throw new IllegalArgumentException("Mã cuộc trò chuyện không hợp lệ.");
        }

        Integer senderId = getCurrentUserId();
        String senderType = getSenderType(auth, senderId);

        ChatMessageResponse savedMessage = chatService.processAndBroadcastMessage(
                conversationId,
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
        String rawContent = req != null ? req.getContent() : null;
        Integer conversationId = req != null ? parseIntegerSafe(req.getConversationId()) : null;
        Authentication resolvedAuth = resolveAuthentication(auth);
        String rawPrincipal = getPrincipalAsString(resolvedAuth);
        Integer senderId = parseIntegerSafe(rawPrincipal);
        String senderType = getSenderType(resolvedAuth, senderId);

        log.debug(
                "Chat WS received: conversationId={}, senderType={}, senderId={}, content={}",
                conversationId,
                senderType,
                rawPrincipal,
                rawContent
        );

        if (conversationId == null) {
            log.warn("Bỏ qua tin nhắn chat vì thiếu mã cuộc trò chuyện hợp lệ.");
            return;
        }

        if (rawContent == null || rawContent.isBlank()) {
            log.warn("Bỏ qua tin nhắn chat vì nội dung trống. conversationId={}", conversationId);
            return;
        }

        if ("GUEST".equalsIgnoreCase(senderType)) {
            log.warn("Bỏ qua tin nhắn chat vì khách chưa đăng nhập. conversationId={}", conversationId);
            return;
        }

        if (!"GUEST".equalsIgnoreCase(senderType) && senderId == null) {
            log.warn("Bỏ qua tin nhắn chat vì không xác định được người gửi hợp lệ. principal={}", rawPrincipal);
            return;
        }

        try {
            chatService.processAndBroadcastMessage(
                    conversationId,
                    senderId,
                    senderType,
                    rawContent.trim()
            );
        } catch (RuntimeException ex) {
            log.warn("Không thể gửi tin nhắn chat: {}", ex.getMessage());
        }
    }
}
