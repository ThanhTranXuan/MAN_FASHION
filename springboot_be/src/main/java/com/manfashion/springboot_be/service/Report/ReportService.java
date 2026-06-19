package com.manfashion.springboot_be.service.Report;

import com.manfashion.springboot_be.DTO.Report.CustomerSummaryResponse;
import com.manfashion.springboot_be.DTO.Report.OverviewResponse;
import com.manfashion.springboot_be.DTO.Report.ProductCategorySummaryResponse;
import com.manfashion.springboot_be.DTO.Report.RevenueSummaryResponse;
import com.manfashion.springboot_be.DTO.Report.TopProductResponse;
import com.manfashion.springboot_be.DTO.Report.TrendResponse;

import java.util.List;

public interface ReportService {
    OverviewResponse getOverview();
    RevenueSummaryResponse getRevenueSummary();
    CustomerSummaryResponse getCustomerSummary();
    List<TrendResponse> getRevenueTrend();
    List<TrendResponse> getCustomerTrend();
    List<TopProductResponse> getTopProductsMonthly();
    List<ProductCategorySummaryResponse> getProductCategorySummary();
}
