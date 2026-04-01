package com.manfashion.springboot_be.DTO.Product;

import lombok.Data;

@Data
public class ProductVariantRequest {
    private String color;
    private String size;
    private Integer stock;
}

