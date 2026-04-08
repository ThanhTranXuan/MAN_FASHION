package com.manfashion.springboot_be.DTO.Cart;

import lombok.Data;

@Data
public class CartItemRequest {
    private String productId;
    private String variantId;
    private Integer quantity;
}
