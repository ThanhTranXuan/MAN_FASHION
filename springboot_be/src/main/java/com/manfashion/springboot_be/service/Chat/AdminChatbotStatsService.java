package com.manfashion.springboot_be.service.Chat;

import com.manfashion.springboot_be.DTO.Chat.AdminChatbotStatsResponse;
import com.manfashion.springboot_be.entity.ReviewStatus;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Product.ProductReviewRepository;
import com.manfashion.springboot_be.repository.Product.ProductVariantRepository;
import com.manfashion.springboot_be.repository.Return.ReturnOrderRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AdminChatbotStatsService {
    private static final int LOW_STOCK_THRESHOLD = 5;

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final OrderRepository orderRepository;
    private final ReturnOrderRepository returnOrderRepository;
    private final ProductReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AdminChatbotStatsResponse getDashboardSummary() {
        LocalDate today = LocalDate.now();
        var startOfToday = today.atStartOfDay();
        var startOfTomorrow = startOfToday.plusDays(1);
        var startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        var startOfNextMonth = startOfMonth.plusMonths(1);

        var lowStock = variantRepository
                .findByStockLessThanAndDeletedAtIsNull(LOW_STOCK_THRESHOLD + 1)
                .stream()
                .limit(10)
                .map(variant -> "%s - %s/%s: %d"
                        .formatted(
                                variant.getProduct().getName(),
                                variant.getColor(),
                                variant.getSize(),
                                variant.getStock()
                        ))
                .toList();

        String latestOrder = orderRepository.findTopByOrderByCreatedAtDesc()
                .map(order -> "%s - %s - %.0f VND - %s"
                        .formatted(order.getOrderCode(), order.getStatus(), order.getFinalTotal(), order.getCreatedAt()))
                .orElse("Chưa có đơn hàng");

        return AdminChatbotStatsResponse.builder()
                .totalProducts(productRepository.countByDeletedAtIsNull())
                .totalVariants(variantRepository.countByDeletedAtIsNull())
                .totalStock(valueOrZero(variantRepository.sumAvailableStock()))
                .lowStockItems(lowStock)
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByStatus("PENDING"))
                .paidOrders(orderRepository.countByStatus("PAID"))
                .completedOrders(orderRepository.countByStatus("COMPLETED"))
                .cancelledOrders(orderRepository.countByStatus("CANCELLED"))
                .returnOrders(orderRepository.countByStatus("RETURN"))
                .revenueToday(valueOrZero(orderRepository.sumRevenueInRange("COMPLETED", startOfToday, startOfTomorrow)))
                .revenueThisMonth(valueOrZero(orderRepository.sumRevenueInRange("COMPLETED", startOfMonth, startOfNextMonth)))
                .totalRevenue(valueOrZero(orderRepository.sumTotalRevenueByStatus("COMPLETED")))
                .totalCustomers(userRepository.countByRole_NameAndDeletedAtIsNull("USER"))
                .totalEmployees(userRepository.countByRole_NameAndDeletedAtIsNull("EMPLOYEE"))
                .pendingReviews(reviewRepository.countByStatusAndDeletedAtIsNull(ReviewStatus.PENDING))
                .pendingReturnRequests(returnOrderRepository.countByStatus("PENDING"))
                .latestOrder(latestOrder)
                .build();
    }

    private long valueOrZero(Long value) {
        return value == null ? 0L : value;
    }

    private double valueOrZero(Double value) {
        return value == null ? 0.0 : value;
    }
}
