package com.manfashion.springboot_be.repository.Order;

import com.manfashion.springboot_be.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order,Integer>, OrderRepositoryCustom {
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
}
