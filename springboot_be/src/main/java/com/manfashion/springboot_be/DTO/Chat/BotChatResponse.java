package com.manfashion.springboot_be.DTO.Chat;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BotChatResponse {
    private String type;
    private String message;
    private List<BotProductSuggestion> products;
    private List<BotCategorySuggestion> categories;
    private List<BotOrderSummary> orders;
    private BotOutfitRecommendation outfit;
    private List<String> suggestedQuestions;
}
