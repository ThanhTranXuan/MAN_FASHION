package com.manfashion.springboot_be.DTO.Report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyRevenueReportResponse {
    private int month;
    private int year;

    private Double totalRevenue;
    private Long totalOrders;          // số đơn DELIVERED trong tháng
    private Long distinctCustomers;    // số khách hàng trong tháng
    private Double averageOrderValue;  // doanh thu / số đơn
    private Double totalRefund;        // tổng tiền hoàn (return_orders)

    private List<MonthlyProductSalesRow> products; // danh sách sản phẩm bán được
}
