package com.manfashion.springboot_be.repository.Payment;

import com.manfashion.springboot_be.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment,Integer> {
    Optional<Payment> findByPaymentOrderCode(Long paymentOrderCode);

    Optional<Payment> findByOrderId(Integer orderId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Payment p WHERE p.orderId = :orderId")
    Optional<Payment> findByOrderIdForUpdate(@Param("orderId") Integer orderId);

    List<Payment> findByOrderIdIn(List<Integer> orderIds);

    boolean existsByPaymentOrderCode(Long paymentOrderCode);

    boolean existsByOrderId(Integer orderId);
}
