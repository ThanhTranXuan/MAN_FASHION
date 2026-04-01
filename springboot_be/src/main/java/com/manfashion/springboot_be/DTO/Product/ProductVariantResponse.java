package com.manfashion.springboot_be.DTO.Product;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductVariantResponse {
    private String id;
    private String color;
    private String size;
    private Integer stock;
}

