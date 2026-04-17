package com.manfashion.springboot_be.DTO.Order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private String id;
    private String orderCode;
    private String userId;
    private String fullName;
    private String email;
    private String phone;
    private String address;

    private String couponId;
    private Double discountPercent;
    private Double discountValue;
    private Double subtotal;
    private Double finalTotal;

    private String status;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String qrCodeUrl;
    private String paymentStatus;
    private String paymentLink;
    private LocalDateTime paidAt;
    private String paymentMethod;

    private List<OrderItemResponse> items;
}
