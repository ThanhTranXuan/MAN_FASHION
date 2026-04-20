package com.manfashion.springboot_be.controller.Chat;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Chat.ChatConversationSummary;
import com.manfashion.springboot_be.DTO.Chat.ChatMessageRequest;
import com.manfashion.springboot_be.DTO.Chat.ChatMessageResponse;
//import com.manfashion.springboot_be.service.Chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

//    private final ChatService chatService;

    // ======================================================
    // 🔐 Helper: Lấy userId từ JWT (REST HTTP)
    // ======================================================
    private Integer getCurrentUserId() {
        var context = SecurityContextHolder.getContext();
        if (context == null || context.getAuthentication() == null) {
            throw new RuntimeException("❌ No authentication in SecurityContext");
        }

        String principal = (String) context.getAuthentication().getPrincipal();
        try {
            // Ép kiểu từ String (Token) sang Integer (MySQL ID)
            return Integer.valueOf(principal);
        } catch (NumberFormatException e) {
            throw new RuntimeException("❌ Invalid Integer ID in token: " + principal);
        }
    }

    // ======================================================
    // USER bắt đầu chat (REST)
    // ======================================================
    @PostMapping("/start")
    public ApiResponse<ChatConversationSummary> start() {
        Integer userId = getCurrentUserId();

        return ApiResponse.<ChatConversationSummary>builder()
                .message("chat.start.success")
//                .data(chatService.startOrGetConversationForUser(userId))
                .build();
    }

    // USER lấy conversation hiện tại (REST)
    @GetMapping("/me")
    public ApiResponse<ChatConversationSummary> getMyConversation() {
        Integer userId = getCurrentUserId();

        return ApiResponse.<ChatConversationSummary>builder()
                .message("chat.get_my.success")
//                .data(chatService.getMyConversation(userId))
                .build();
    }

    // 📩 Lấy tin nhắn theo phòng chat (REST) – PAGING
    // GET /api/chat/{conversationId}/messages?page=0&size=30
    @GetMapping("/{conversationId}/messages")
    public ApiResponse<Page<ChatMessageResponse>> getMessages(
            @PathVariable Integer conversationId, // Đổi sang Integer cho khớp MySQL
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        return ApiResponse.<Page<ChatMessageResponse>>builder()
                .message("chat.get_messages.success")
//                .data(chatService.getMessagesPaged(conversationId, page, size))
                .build();
    }

    // 🟣 STAFF: lấy danh sách conversation (REST) – PAGING
    // GET /api/chat/admin/conversations?page=0&size=20
    @GetMapping("/admin/conversations")
    public ApiResponse<Page<ChatConversationSummary>> getAllForStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<Page<ChatConversationSummary>>builder()
                .message("chat.get_conversations.success")
//                .data(chatService.getAllConversationsForStaffPaged(page, size))
                .build();
    }

    // ======================================================
    // ⬇ WEBSOCKET gửi tin nhắn (Không dùng ApiResponse ở đây)
    // ======================================================
    @MessageMapping("/chat/send")
    public void sendMessage(@Payload ChatMessageRequest req, Principal principal) {
        if (!(principal instanceof Authentication auth)) {
            throw new RuntimeException("❌ Unauthenticated WebSocket user");
        }

        String principalStr = (String) auth.getPrincipal();
        Integer senderId;
        try {
            // Ép kiểu từ WebSocket Principal sang Integer
            senderId = Integer.valueOf(principalStr);
        } catch (NumberFormatException e) {
            throw new RuntimeException("❌ Invalid userId in WebSocket principal: " + principalStr);
        }

        // Kiểm tra quyền Admin/Employee
        boolean staff = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals("ADMIN") || r.equals("EMPLOYEE"));

//        chatService.receiveFromWebSocket(req, senderId, staff);
    }
}