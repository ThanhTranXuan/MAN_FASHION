package com.manfashion.springboot_be.controller.Chat;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Chat.*;
//import com.manfashion.springboot_be.service.Chat.ChatService;
import com.manfashion.springboot_be.entity.ChatConversation;
import com.manfashion.springboot_be.mapper.ChatMapper;
import com.manfashion.springboot_be.service.Chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final ChatMapper chatMapper;
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
    // 1. Khởi tạo Chat
    @PostMapping("/start")
    public ApiResponse<ChatConversationSummary> start() {
        Integer userId = getCurrentUserId();
        ChatConversation conversation = chatService.getOrCreateConversation(userId);
        return ApiResponse.<ChatConversationSummary>builder()
                .message("chat.start.success")
                .data(chatMapper.toSummary(conversation))
                .build();
    }

    // 2. Lấy phòng chat hiện tại (Dành cho User)
    @GetMapping("/me")
    public ApiResponse<ChatConversationSummary> getMyConversation() {
        Integer userId = getCurrentUserId();
        ChatConversation conversation = chatService.getOrCreateConversation(userId);
        return ApiResponse.<ChatConversationSummary>builder()
                .message("chat.get_my.success")
                .data(chatMapper.toSummary(conversation))
                .build();
    }

    // 3. Lấy lịch sử tin nhắn (Phân trang)
    @GetMapping("/{conversationId}/messages")
    public ApiResponse<Page<ChatMessageResponse>> getMessages(
            @PathVariable Integer conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        return ApiResponse.<Page<ChatMessageResponse>>builder()
                .message("chat.get_messages.success")
                .data(chatService.getMessagesPaged(conversationId, page, size))
                .build();
    }

    // 4. Admin lấy danh sách phòng chat
    @GetMapping("/admin/conversations")
    public ApiResponse<Page<ChatConversationSummary>> getAllForStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<Page<ChatConversationSummary>>builder()
                .message("chat.get_conversations.success")
                .data(chatService.getAllConversationsForStaffPaged(page, size))
                .build();
    }

    // 5. Gửi tin nhắn qua REST API (Chuẩn thiết kế mới của FE)
    @PostMapping("/send")
    public ApiResponse<MessageDetailResponse> sendMessageREST(
            @RequestBody ChatMessageRequest req,
            Authentication auth
    ) {
        Integer senderId = getCurrentUserId();

        // Phân quyền: Xác định ai đang gửi
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(r -> r.getAuthority().equals("ADMIN") || r.getAuthority().equals("EMPLOYEE"));
        String senderType = isStaff ? "EMPLOYEE" : "USER";

        MessageDetailResponse savedMessage = chatService.processAndBroadcastMessage(
                Integer.valueOf(req.getConversationId()),
                senderId,
                senderType,
                req.getContent()
        );

        return ApiResponse.<MessageDetailResponse>builder()
                .message("Tin nhắn đã gửi")
                .data(savedMessage)
                .build();
    }

    // 6. Đánh dấu đã đọc
    @PutMapping("/mark-read")
    public ApiResponse<Map<String, Boolean>> markRead(@RequestBody MarkReadRequest req) {
        Integer userId = getCurrentUserId();
        chatService.markConversationAsRead(req.getConversationId(), userId);
        return ApiResponse.<Map<String, Boolean>>builder()
                .message("Đã cập nhật trạng thái đọc")
                .data(Map.of("success", true))
                .build();
    }


    @MessageMapping("/chat/send") // Phải khớp chính xác với FE gửi lên
    public void handleWebSocketMessage(@Payload ChatMessageRequest req, Authentication auth) {
        // 1. Trích xuất senderId từ Principal (đã cấu hình trong WebSocketConfig)
        Integer senderId = Integer.valueOf((String) auth.getPrincipal());

        // 2. Xác định vai trò để gán senderType
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("EMPLOYEE"));
        String senderType = isStaff ? "EMPLOYEE" : "USER";

        // 3. Gọi Service để lưu vào MySQL và Broadcast ngược lại
        // Dùng đúng hàm chatService mà bạn đã viết logic xử lý
        chatService.processAndBroadcastMessage(
                Integer.valueOf(req.getConversationId()),
                senderId,
                senderType,
                req.getContent()
        );
    }

}