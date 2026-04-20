package com.manfashion.springboot_be.DTO.Chat;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class ChatConversationSummary {
    private String id;
    private String userName;
    private String lastMessageText;
    private Instant lastMessageAt;
    private String status;
}
