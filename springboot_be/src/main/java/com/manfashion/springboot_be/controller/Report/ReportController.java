package com.manfashion.springboot_be.controller.Report;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Report.*;
import com.manfashion.springboot_be.service.Report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    // =====================================================
    // 📊 DỮ LIỆU JSON (DÙNG API RESPONSE)
    // =====================================================

    // 📊 Overview
    @GetMapping("/overview")
    public ApiResponse<OverviewResponse> getOverview() {
        return ApiResponse.<OverviewResponse>builder()
                .message("report.overview.success")
                .data(reportService.getOverview())
                .build();
    }

    // 💰 Revenue Summary (this month vs last month)
    @GetMapping("/revenue/summary")
    public ApiResponse<RevenueSummaryResponse> getRevenueSummary() {
        return ApiResponse.<RevenueSummaryResponse>builder()
                .message("report.revenue_summary.success")
                .data(reportService.getRevenueSummary())
                .build();
    }

    // 👥 Customer Summary (this month vs last month)
    @GetMapping("/customers/summary")
    public ApiResponse<CustomerSummaryResponse> getCustomerSummary() {
        return ApiResponse.<CustomerSummaryResponse>builder()
                .message("report.customer_summary.success")
                .data(reportService.getCustomerSummary())
                .build();
    }

    // 📈 Revenue Trend (last 6 months)
    @GetMapping("/revenue/trend")
    public ApiResponse<List<TrendResponse>> getRevenueTrend() {
        return ApiResponse.<List<TrendResponse>>builder()
                .message("report.revenue_trend.success")
                .data(reportService.getRevenueTrend())
                .build();
    }

    // 📈 Customer Trend (last 6 months)
    @GetMapping("/customers/trend")
    public ApiResponse<List<TrendResponse>> getCustomerTrend() {
        return ApiResponse.<List<TrendResponse>>builder()
                .message("report.customer_trend.success")
                .data(reportService.getCustomerTrend())
                .build();
    }

    // 🏅 Top 5 Products Monthly
    @GetMapping("/products/top-monthly")
    public ApiResponse<List<TopProductResponse>> getTopProductsMonthly() {
        return ApiResponse.<List<TopProductResponse>>builder()
                .message("report.top_products.success")
                .data(reportService.getTopProductsMonthly())
                .build();
    }

    // ⭐ Top 3 Employees Monthly (total hours) – dùng cho dashboard
    @GetMapping("/employees/top-monthly")
    public ApiResponse<List<TopEmployeeResponse>> getTopEmployeesMonthly(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        return ApiResponse.<List<TopEmployeeResponse>>builder()
                .message("report.top_employees.success")
                .data(reportService.getTopEmployeesMonthly(month, year))
                .build();
    }

}
