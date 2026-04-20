package com.manfashion.springboot_be.DTO.Report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverviewResponse {
    private double totalRevenue;
    private long totalEmployees;
    private long totalCustomers;
    private long totalCategories;
    private long totalProducts;
    private long totalOrders;
}
