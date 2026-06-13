package com.manfashion.springboot_be.DTO.Chat;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminChatbotStatsResponse {
    private long totalProducts;
    private long totalVariants;
    private long totalStock;
    private List<String> lowStockItems;
    private long totalOrders;
    private long pendingOrders;
    private long paidOrders;
    private long completedOrders;
    private long cancelledOrders;
    private long returnOrders;
    private double revenueToday;
    private double revenueThisMonth;
    private double totalRevenue;
    private long totalCustomers;
    private long totalEmployees;
    private long pendingReviews;
    private long pendingReturnRequests;
    private String latestOrder;
}
