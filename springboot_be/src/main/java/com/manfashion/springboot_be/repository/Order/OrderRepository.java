package com.manfashion.springboot_be.repository.Order;

import com.manfashion.springboot_be.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order,Integer>, OrderRepositoryCustom ,JpaSpecificationExecutor<Order> {
    // =========================================================================
    // NHÓM 1: TRUY VẤN TĨNH (Sử dụng Spring Data JPA mặc định)
    // Nghiệp vụ yêu cầu tham số phải đầy đủ, không được null.
    // =========================================================================

    // 1. Nghiệp vụ xem chi tiết 1 đơn hàng (dùng cho Admin hoặc hệ thống)
    Optional<Order> findByOrderCode(String orderCode);

    // 2. Nghiệp vụ kiểm tra trùng lặp mã đơn khi tạo mới
    boolean existsByOrderCode(String orderCode);

    // 3. Nghiệp vụ xem lịch sử mua hàng của 1 user cụ thể (có phân trang)
    Page<Order> findByUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    // 4. Nghiệp vụ bảo mật: lấy chi tiết đơn hàng nhưng phải đúng là của user đó
    Optional<Order> findByOrderCodeAndUserId(String orderCode, Integer userId);

    // 5. Nghiệp vụ Job chạy ngầm: Quét các đơn hàng chờ thanh toán quá hạn
    List<Order> findAllByStatusAndPaymentMethodAndCreatedAtBefore(String status, String paymentMethod, LocalDateTime createdAt);

    // 6. Nghiệp vụ Job chạy ngầm: Tự động hoàn thành đơn sau X ngày giao hàng
    List<Order> findByStatusAndDeliveredAtBefore(String status, LocalDateTime cutoff);

    // 7. Nghiệp vụ xử lý Callback từ cổng thanh toán (khớp nhiều điều kiện chặt chẽ)
    Optional<Order> findTopByCheckoutSessionIdAndStatusAndPaymentMethodAndCreatedAtAfter(
            String checkoutSessionId,
            String status,
            String paymentMethod,
            LocalDateTime createdAt
    );
    boolean existsByCreatedAtAfter(LocalDateTime createdAt);
    // Tổng doanh thu (All time)
    @Query("SELECT SUM(o.finalTotal) FROM Order o WHERE o.status = :status")
    Double sumTotalRevenueByStatus(@Param("status") String status);

    // Số khách hàng độc nhất (All time)
    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o WHERE o.status <> :excludeStatus")
    long countDistinctUsersByStatusNot(@Param("excludeStatus") String excludeStatus);

    // Thống kê doanh thu theo khoảng thời gian
    @Query("SELECT SUM(o.finalTotal) FROM Order o WHERE o.status = :status AND o.createdAt >= :start AND o.createdAt < :end")
    Double sumRevenueInRange(@Param("status") String status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Đếm số đơn hàng theo khoảng thời gian
    long countByStatusAndCreatedAtBetween(String status, LocalDateTime start, LocalDateTime end);

    // Đếm khách hàng mới trong tháng
    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o WHERE o.status <> :excludeStatus AND o.createdAt >= :start AND o.createdAt < :end")
    long countNewCustomersInRange(@Param("excludeStatus") String excludeStatus, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Trend doanh thu 6 tháng (Native Query)
    @Query(value = "SELECT YEAR(created_at) as y, MONTH(created_at) as m, SUM(final_total) as val " +
            "FROM orders WHERE status = :status AND created_at >= :startDate " +
            "GROUP BY y, m ORDER BY y ASC, m ASC", nativeQuery = true)
    List<Object[]> getRevenueTrend(@Param("status") String status, @Param("startDate") LocalDateTime startDate);

    // Trend khách hàng 6 tháng (Native Query)
    @Query(value = "SELECT yr, mth, COUNT(DISTINCT user_id) FROM (" +
            "  SELECT user_id, YEAR(created_at) as yr, MONTH(created_at) as mth " +
            "  FROM orders WHERE status != :excludeStatus AND created_at >= :startDate" +
            ") as subquery GROUP BY yr, mth ORDER BY yr ASC, mth ASC", nativeQuery = true)
    List<Object[]> getCustomerTrend(@Param("excludeStatus") String excludeStatus, @Param("startDate") LocalDateTime startDate);
}
