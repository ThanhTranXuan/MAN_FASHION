package com.manfashion.springboot_be.DTO.Chat;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BotChatResponse {
    private String message;
    private List<BotProductSuggestion> products;
    private List<String> suggestedQuestions;
}
