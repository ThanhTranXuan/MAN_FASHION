package com.manfashion.springboot_be.DTO.Return;

import lombok.Data;

import java.util.List;

@Data
public class ReturnOrderRequest {
    private String orderCode;
    private String reason;
    private String note;
    private List<ReturnItemRequest> items;
}
