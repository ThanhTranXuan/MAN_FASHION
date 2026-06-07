package com.manfashion.springboot_be.DTO.Product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductStatsResponse {
    private String name;
    private String description;
    private Double price;
    private String categoryId;
    @Builder.Default
    private Boolean isActive = true;
}
