package com.manfashion.springboot_be.DTO.Return;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReturnOrderResponse {
    private String id;
    private String returnCode;
    private String orderId;
    private String orderCode;
    private String userId;
    private String reason;
    private String note;
    private String status;
    private Double refundAmount;
    private List<ReturnItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
