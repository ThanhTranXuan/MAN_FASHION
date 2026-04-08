package com.manfashion.springboot_be.DTO.Cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private String id;
    private String cartId;
    private String productId;
    private String variantId;
    private Integer quantity;
    private String productName;
    private String color;
    private String size;
    private Double price;
    private String thumbnailUrl;
}
