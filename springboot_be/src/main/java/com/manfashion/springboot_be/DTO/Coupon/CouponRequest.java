package com.manfashion.springboot_be.DTO.Coupon;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CouponRequest {
    private String code;
    private Double discountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Double points;
}
