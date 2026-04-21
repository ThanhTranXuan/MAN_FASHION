package com.manfashion.springboot_be.DTO.Chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDetailResponse {

    private Integer messageId; // ID của tin nhắn trong MySQL

    private Integer conversationId; // ID của phòng chat

    private SenderInfo sender; // Object chứa thông tin người gửi

    private String content; // Nội dung chat

    private LocalDateTime timestamp; // Thời gian gửi

    private String status; // Các trạng thái: "SENT", "DELIVERED", "READ"
}
