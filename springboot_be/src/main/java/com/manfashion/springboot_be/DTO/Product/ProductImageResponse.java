package com.manfashion.springboot_be.DTO.Product;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductImageResponse {
    private String id;
    private String productId;
    private String color;
    private String url;
    private Boolean isThumbnail;
}

