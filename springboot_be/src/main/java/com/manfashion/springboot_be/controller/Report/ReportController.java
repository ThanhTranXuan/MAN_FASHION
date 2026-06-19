package com.manfashion.springboot_be.controller.Report;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Report.CustomerSummaryResponse;
import com.manfashion.springboot_be.DTO.Report.OverviewResponse;
import com.manfashion.springboot_be.DTO.Report.ProductCategorySummaryResponse;
import com.manfashion.springboot_be.DTO.Report.RevenueSummaryResponse;
import com.manfashion.springboot_be.DTO.Report.TopProductResponse;
import com.manfashion.springboot_be.DTO.Report.TrendResponse;
import com.manfashion.springboot_be.service.Report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/overview")
    public ApiResponse<OverviewResponse> getOverview() {
        return ApiResponse.<OverviewResponse>builder()
                .message("report.overview.success")
                .data(reportService.getOverview())
                .build();
    }

    @GetMapping("/revenue/summary")
    public ApiResponse<RevenueSummaryResponse> getRevenueSummary() {
        return ApiResponse.<RevenueSummaryResponse>builder()
                .message("report.revenue_summary.success")
                .data(reportService.getRevenueSummary())
                .build();
    }

    @GetMapping("/customers/summary")
    public ApiResponse<CustomerSummaryResponse> getCustomerSummary() {
        return ApiResponse.<CustomerSummaryResponse>builder()
                .message("report.customer_summary.success")
                .data(reportService.getCustomerSummary())
                .build();
    }

    @GetMapping("/revenue/trend")
    public ApiResponse<List<TrendResponse>> getRevenueTrend() {
        return ApiResponse.<List<TrendResponse>>builder()
                .message("report.revenue_trend.success")
                .data(reportService.getRevenueTrend())
                .build();
    }

    @GetMapping("/customers/trend")
    public ApiResponse<List<TrendResponse>> getCustomerTrend() {
        return ApiResponse.<List<TrendResponse>>builder()
                .message("report.customer_trend.success")
                .data(reportService.getCustomerTrend())
                .build();
    }

    @GetMapping("/products/top-monthly")
    public ApiResponse<List<TopProductResponse>> getTopProductsMonthly() {
        return ApiResponse.<List<TopProductResponse>>builder()
                .message("report.top_products.success")
                .data(reportService.getTopProductsMonthly())
                .build();
    }

    @GetMapping("/products/category-summary")
    public ApiResponse<List<ProductCategorySummaryResponse>> getProductCategorySummary() {
        return ApiResponse.<List<ProductCategorySummaryResponse>>builder()
                .message("report.product_category_summary.success")
                .data(reportService.getProductCategorySummary())
                .build();
    }
}
