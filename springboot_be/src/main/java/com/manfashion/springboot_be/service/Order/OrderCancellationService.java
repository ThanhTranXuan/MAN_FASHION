package com.manfashion.springboot_be.service.Order;

import com.manfashion.springboot_be.entity.Order;
import com.manfashion.springboot_be.entity.Payment;
import com.manfashion.springboot_be.repository.Order.OrderItemRepository;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Payment.PaymentRepository;
import com.manfashion.springboot_be.repository.Product.ProductVariantRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCancellationService {
    private static final Set<String> PROTECTED_STATUSES =
            Set.of("PAID", "DELIVERED", "COMPLETED", "RETURN");

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository variantRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public boolean cancelAndRestoreStock(Integer orderId, String paymentStatus, String reason) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("CANCELLED".equals(order.getStatus())) {
            log.info("Order {} was already cancelled, skip duplicate stock restore", order.getOrderCode());
            return false;
        }
        if (PROTECTED_STATUSES.contains(order.getStatus())) {
            log.warn("Skip cancellation for protected order status: orderId={}, status={}", orderId, order.getStatus());
            return false;
        }

        Payment payment = paymentRepository.findByOrderIdForUpdate(orderId).orElse(null);
        if (payment != null && "PAID".equals(payment.getPaymentStatus())) {
            log.warn("Skip cancellation because payment is already PAID: orderId={}", orderId);
            return false;
        }

        if (!Boolean.TRUE.equals(order.getStockRestored())) {
            orderItemRepository.findByOrderId(orderId).forEach(item ->
                    variantRepository.incrementStock(item.getVariant().getId(), item.getQuantity())
            );
            order.setStockRestored(true);
            log.info("Restore stock for cancelled payment order: orderId={}", orderId);
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        if (payment != null) {
            payment.setPaymentStatus(paymentStatus);
            payment.setFailureReason(reason);
            paymentRepository.save(payment);
        }

        return true;
    }
}
