package com.manfashion.springboot_be.DTO.Coupon;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CouponResponse {
    private String id;
    private String code;
    private Double discountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private Double points;
    private boolean isActive;
}

