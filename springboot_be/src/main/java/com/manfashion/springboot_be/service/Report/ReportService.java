package com.manfashion.springboot_be.service.Report;

import com.manfashion.springboot_be.DTO.Report.*;

import java.util.List;

public interface ReportService {
    OverviewResponse getOverview();
    RevenueSummaryResponse getRevenueSummary();
    CustomerSummaryResponse getCustomerSummary();
    List<TrendResponse> getRevenueTrend();
    List<TrendResponse> getCustomerTrend();
    List<TopProductResponse> getTopProductsMonthly();
    List<TopEmployeeResponse> getTopEmployeesMonthly(Integer month, Integer year);
}
