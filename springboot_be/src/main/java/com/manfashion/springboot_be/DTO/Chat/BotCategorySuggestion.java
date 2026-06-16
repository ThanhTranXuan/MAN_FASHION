package com.manfashion.springboot_be.DTO.Chat;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BotCategorySuggestion {
    private Integer id;
    private String name;
    private String slug;
    private String thumbnail;
    private String description;
}
