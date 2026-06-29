package com.manfashion.springboot_be.repository.Order;

import com.manfashion.springboot_be.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

public interface OrderRepository extends JpaRepository<Order,Integer>, OrderRepositoryCustom ,JpaSpecificationExecutor<Order> {






    Optional<Order> findByOrderCode(String orderCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Integer id);


    boolean existsByOrderCode(String orderCode);


    Page<Order> findByUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);


    Optional<Order> findByOrderCodeAndUserId(String orderCode, Integer userId);


    List<Order> findAllByStatusAndPaymentMethodAndCreatedAtBefore(String status, String paymentMethod, LocalDateTime createdAt);


    List<Order> findByStatusAndDeliveredAtBefore(String status, LocalDateTime cutoff);


    Optional<Order> findTopByCheckoutSessionIdAndStatusAndPaymentMethodAndCreatedAtAfter(
            String checkoutSessionId,
            String status,
            String paymentMethod,
            LocalDateTime createdAt
    );
    boolean existsByCreatedAtAfter(LocalDateTime createdAt);
    long countByStatus(String status);
    Optional<Order> findTopByOrderByCreatedAtDesc();

    @Query("SELECT SUM(o.finalTotal) FROM Order o WHERE o.status = :status")
    Double sumTotalRevenueByStatus(@Param("status") String status);


    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o WHERE o.status <> :excludeStatus")
    long countDistinctUsersByStatusNot(@Param("excludeStatus") String excludeStatus);


    @Query("SELECT SUM(o.finalTotal) FROM Order o WHERE o.status = :status AND o.createdAt >= :start AND o.createdAt < :end")
    Double sumRevenueInRange(@Param("status") String status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


    long countByStatusAndCreatedAtBetween(String status, LocalDateTime start, LocalDateTime end);


    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o WHERE o.status <> :excludeStatus AND o.createdAt >= :start AND o.createdAt < :end")
    long countNewCustomersInRange(@Param("excludeStatus") String excludeStatus, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


    @Query(value = "SELECT YEAR(created_at) as y, MONTH(created_at) as m, SUM(final_total) as val " +
            "FROM orders WHERE status = :status AND created_at >= :startDate " +
            "GROUP BY y, m ORDER BY y ASC, m ASC", nativeQuery = true)
    List<Object[]> getRevenueTrend(@Param("status") String status, @Param("startDate") LocalDateTime startDate);


    @Query(value = "SELECT yr, mth, COUNT(DISTINCT user_id) FROM (" +
            "  SELECT user_id, YEAR(created_at) as yr, MONTH(created_at) as mth " +
            "  FROM orders WHERE status != :excludeStatus AND created_at >= :startDate" +
            ") as subquery GROUP BY yr, mth ORDER BY yr ASC, mth ASC", nativeQuery = true)
    List<Object[]> getCustomerTrend(@Param("excludeStatus") String excludeStatus, @Param("startDate") LocalDateTime startDate);
}
