package com.manfashion.springboot_be.DTO.Product;

import lombok.Data;

import java.util.List;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private Double price;
    private String categoryId;
    private Boolean isActive = true;
    private List<String> remainingImageUrls;
    private List<Integer> deletedImageIds;
}
