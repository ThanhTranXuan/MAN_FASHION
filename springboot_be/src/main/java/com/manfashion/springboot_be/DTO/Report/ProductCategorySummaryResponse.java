package com.manfashion.springboot_be.DTO.Report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategorySummaryResponse {
    private Integer categoryId;
    private String categoryName;
    private Long productCount;
    private Long totalStock;
}
