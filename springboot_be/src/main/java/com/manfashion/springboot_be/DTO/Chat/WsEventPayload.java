package com.manfashion.springboot_be.DTO.Chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WsEventPayload {

    private String type; // Ví dụ: "NEW_MESSAGE"

    private ChatMessageResponse payload; // Chứa nội dung chính của tin nhắn
}
