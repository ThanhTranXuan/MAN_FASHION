package com.manfashion.springboot_be.DTO.Report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueSummaryResponse {
    private double currentMonthRevenue;
    private long currentMonthOrders;
    private double previousMonthRevenue;
    private long previousMonthOrders;
    private double growthRate;
}
