package com.manfashion.springboot_be.DTO.Chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String id;
    private String senderType; // USER | EMPLOYEE
    private String senderName;
    private String content;
    private LocalDateTime createdAt;
}
