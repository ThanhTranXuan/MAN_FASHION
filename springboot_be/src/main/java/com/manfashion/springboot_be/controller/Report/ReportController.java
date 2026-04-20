package com.manfashion.springboot_be.controller.Report;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Report.*;
import com.manfashion.springboot_be.service.Report.EmployeePayrollPdfService;
import com.manfashion.springboot_be.service.Report.MonthlyRevenuePdfService;
import com.manfashion.springboot_be.service.Report.ProductReportPdfService;
import com.manfashion.springboot_be.service.Report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    private final MonthlyRevenuePdfService monthlyRevenuePdfService;
    private final ProductReportPdfService productReportPdfService;
    private final EmployeePayrollPdfService employeePayrollPdfService;

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

    // =====================================================
    // 🖨️ XUẤT FILE PDF (BẮT BUỘC DÙNG RESPONSE ENTITY)
    // =====================================================

    // 🧾 Export Monthly Revenue Report as PDF
    @GetMapping("/monthly-revenue/pdf")
    public ResponseEntity<byte[]> exportMonthlyRevenuePdf(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        byte[] pdfBytes = monthlyRevenuePdfService.generateMonthlyRevenuePdf(month, year);

        int m = (month != null) ? month : java.time.LocalDate.now().getMonthValue();
        int y = (year != null) ? year : java.time.LocalDate.now().getYear();

        String fileName = String.format("monthly-revenue-%02d-%d.pdf", m, y);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(pdfBytes);
    }

    // 📦 Export Product Sales Report (Monthly) as PDF
    @GetMapping("/products/monthly/pdf")
    public ResponseEntity<byte[]> exportProductMonthlyPdf(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        byte[] pdfBytes = productReportPdfService.generateProductMonthlyPdf(month, year);

        int m = (month != null) ? month : java.time.LocalDate.now().getMonthValue();
        int y = (year != null) ? year : java.time.LocalDate.now().getYear();

        String fileName = String.format("product-report-%02d-%d.pdf", m, y);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(pdfBytes);
    }

    // 👥 Export Employee Attendance & Payroll Report (Monthly) as PDF
    @GetMapping("/employees/payroll/monthly/pdf")
    public ResponseEntity<byte[]> exportEmployeePayrollMonthlyPdf(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        byte[] pdfBytes = employeePayrollPdfService.generateEmployeePayrollMonthlyPdf(month, year);

        int m = (month != null) ? month : java.time.LocalDate.now().getMonthValue();
        int y = (year != null) ? year : java.time.LocalDate.now().getYear();

        String fileName = String.format("employee-payroll-%02d-%d.pdf", m, y);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(pdfBytes);
    }
}
