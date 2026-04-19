package com.manfashion.springboot_be.DTO.Return;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnItemResponse {
    private String id;
    private String orderItemId;
    private int quantity;
    private double unitPrice;
    private String status;
    private LocalDateTime createdAt;
}
