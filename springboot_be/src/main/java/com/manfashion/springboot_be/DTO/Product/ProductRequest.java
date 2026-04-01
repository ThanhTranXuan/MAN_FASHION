package com.manfashion.springboot_be.DTO.Product;

import lombok.Data;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private Double price;
    private String categoryId;
    private Boolean isActive = true;
}
