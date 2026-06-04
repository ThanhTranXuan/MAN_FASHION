package com.manfashion.springboot_be.repository.Payment;

import com.manfashion.springboot_be.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment,Integer> {
    Optional<Payment> findByPaymentOrderCode(Long paymentOrderCode);

    Optional<Payment> findByOrderId(Integer orderId);

    List<Payment> findByOrderIdIn(List<Integer> orderIds);

    boolean existsByPaymentOrderCode(Long paymentOrderCode);
}
