package com.manfashion.springboot_be.DTO.Order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemResponse {
    private String id;
    private String productId;
    private String variantId;
    private String productName;
    private String color;
    private String size;
    private String imageUrl;
    private String thumbnailUrl;
    private Integer quantity;
    private Double price;
    private Boolean reviewed;
    private Long reviewId;
}
