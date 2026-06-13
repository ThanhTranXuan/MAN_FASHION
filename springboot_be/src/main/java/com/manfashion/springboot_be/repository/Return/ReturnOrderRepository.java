package com.manfashion.springboot_be.repository.Return;

import com.manfashion.springboot_be.entity.ReturnItem;
import com.manfashion.springboot_be.entity.ReturnOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ReturnOrderRepository extends JpaRepository<ReturnOrder,Integer>, JpaSpecificationExecutor<ReturnOrder> {
    Page<ReturnOrder> findByUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    Optional<ReturnOrder> findByReturnCode(String returnCode);
    boolean existsByCreatedAtAfter(LocalDateTime date);
    long countByStatus(String status);
    @Query("SELECT SUM(ro.refundAmount) FROM ReturnOrder ro WHERE ro.status = :status AND ro.createdAt >= :start AND ro.createdAt < :end")
    Double sumRefundAmountInRange(@Param("status") String status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
