package com.manfashion.springboot_be.DTO.Chat;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String conversationId;
    private String content;
}
