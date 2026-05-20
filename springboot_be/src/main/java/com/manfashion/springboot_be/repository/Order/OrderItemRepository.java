package com.manfashion.springboot_be.repository.Order;

import com.manfashion.springboot_be.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrderId(Integer orderId);
    boolean existsByProduct_IdAndOrder_User_IdAndOrder_StatusIn(Integer productId, Integer userId, List<String> statuses);
    // 1. Top sản phẩm bán chạy trong khoảng thời gian (Đã fix lỗi cú pháp LIMIT của JPQL)
    @Query("SELECT p.id, p.name, " +
            "COALESCE((SELECT MAX(pi.url) FROM ProductImage pi WHERE pi.product.id = p.id AND pi.isThumbnail = true AND pi.deletedAt IS NULL), " +
            "(SELECT MIN(pi2.url) FROM ProductImage pi2 WHERE pi2.product.id = p.id AND pi2.deletedAt IS NULL)), " +
            "SUM(oi.quantity), SUM(oi.price * oi.quantity) " +
            "FROM OrderItem oi JOIN oi.order o JOIN oi.variant pv JOIN pv.product p " +
            "WHERE o.status = :status AND o.createdAt >= :start AND o.createdAt < :end " +
            "GROUP BY p.id, p.name " +
            "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopProducts(@Param("status") String status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    // 2. Chi tiết doanh số từng sản phẩm cho báo cáo PDF
    @Query("SELECT p.id, p.name, p.slug, SUM(oi.quantity), SUM(oi.price * oi.quantity) " +
            "FROM OrderItem oi JOIN oi.order o JOIN oi.variant pv JOIN pv.product p " +
            "WHERE o.status = :status AND o.createdAt >= :start AND o.createdAt < :end " +
            "GROUP BY p.id, p.name, p.slug " +
            "ORDER BY p.name ASC")
    List<Object[]> getMonthlyProductSales(@Param("status") String status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Lấy danh sách item theo orderId
    List<OrderItem> findByOrder_Id(Integer orderId);
}
