package com.manfashion.springboot_be.DTO.Chat;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BotProductSuggestion {
    private Integer id;
    private String name;
    private Double price;
    private String imageUrl;
    private String slug;
    private String categoryName;
    private List<String> sizes;
    private List<String> colors;
    private Integer stock;
}
