package com.manfashion.springboot_be.DTO.Product;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductResponse {
    private String id;
    private String name;
    private String slug;
    private String description;
    private Double price;
    private Integer categoryId;
    private String categoryName;
    private Boolean isActive;
    private List<ProductVariantResponse> variants;
    private List<ProductImageResponse> images;
}
