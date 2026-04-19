package com.manfashion.springboot_be.DTO.Return;

import lombok.Data;

@Data
public class ReturnItemRequest {
    private String orderItemId;
    private Integer quantity;
    private Double unitPrice;
}
