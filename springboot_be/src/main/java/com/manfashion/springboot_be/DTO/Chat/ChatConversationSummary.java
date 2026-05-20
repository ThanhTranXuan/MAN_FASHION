package com.manfashion.springboot_be.DTO.Chat;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ChatConversationSummary {
    private String id;
    private String userName;
    private String userAvatarUrl;
    private String lastMessageText;
    private LocalDateTime lastMessageAt;
    private String status;
}
