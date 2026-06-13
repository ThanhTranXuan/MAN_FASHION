package com.manfashion.springboot_be.service.Chat;

import com.manfashion.springboot_be.DTO.Chat.AdminChatbotStatsResponse;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.service.Order.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GeminiChatServiceTest {
    private AdminChatbotStatsService statsService;
    private GeminiChatService service;

    @BeforeEach
    void setUp() {
        statsService = mock(AdminChatbotStatsService.class);
        service = new GeminiChatService(
                mock(RestClient.class),
                mock(ProductRepository.class),
                mock(OrderRepository.class),
                mock(OrderService.class),
                statsService
        );

        when(statsService.getDashboardSummary()).thenReturn(
                AdminChatbotStatsResponse.builder()
                        .totalProducts(20)
                        .totalVariants(50)
                        .totalStock(300)
                        .lowStockItems(List.of("Áo sơ mi - Đen/L: 2"))
                        .totalOrders(100)
                        .pendingOrders(8)
                        .paidOrders(12)
                        .completedOrders(70)
                        .cancelledOrders(5)
                        .returnOrders(5)
                        .revenueToday(1_000_000)
                        .revenueThisMonth(20_000_000)
                        .totalRevenue(100_000_000)
                        .totalCustomers(40)
                        .totalEmployees(3)
                        .pendingReviews(4)
                        .pendingReturnRequests(2)
                        .latestOrder("ORD-100 - PENDING")
                        .build()
        );
    }

    @Test
    void adminCanAskDashboardSummaryUsingGenericStatisticsPhrase() {
        String answer = service.askBot("admin-session", "Cho tôi xem thống kê tổng quan", 1, "ADMIN");

        assertThat(answer)
                .contains("Số liệu thật từ hệ thống")
                .contains("Sản phẩm: 20")
                .contains("Tổng đơn: 100");
    }

    @Test
    void employeeCanAskOperationalOrderStatistics() {
        String answer = service.askBot("employee-session", "Có bao nhiêu đơn đang chờ xử lý?", 2, "EMPLOYEE");

        assertThat(answer)
                .contains("8 đơn chờ xử lý")
                .contains("12 đơn đã thanh toán");
    }

    @Test
    void regularUserCannotAskAdministrativeStatistics() {
        String answer = service.askBot("user-session", "Thống kê doanh thu tháng này", 3, "USER");

        assertThat(answer).contains("chỉ dành cho quản trị viên");
    }
}
