package com.manfashion.springboot_be.DTO.Chat;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BotOutfitRecommendation {
    private BotProductSuggestion top;
    private BotProductSuggestion bottom;
    private BotProductSuggestion shoes;
    private BotProductSuggestion accessory;
    private String sizeSuggestion;
    private String reason;
}
