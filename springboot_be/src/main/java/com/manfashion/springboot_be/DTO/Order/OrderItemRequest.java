package com.manfashion.springboot_be.DTO.Order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemRequest {
    private String productId;
    private String variantId;
    private Integer quantity;
    private Double price;
}
