package com.manfashion.springboot_be.DTO.Chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDetailResponse {

    private Integer messageId;

    private Integer conversationId;

    private SenderInfo sender;

    private String content;

    private LocalDateTime timestamp;

    private String status;
}
