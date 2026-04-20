package com.manfashion.springboot_be.DTO.Report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyProductSalesRow {
    private String productId;
    private String productName;
    private String slug;
    private Long totalQuantity;
    private Double totalRevenue;
}
