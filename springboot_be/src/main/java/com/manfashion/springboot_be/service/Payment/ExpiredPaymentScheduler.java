package com.manfashion.springboot_be.service.Payment;

import com.manfashion.springboot_be.entity.Order;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.service.Order.OrderCancellationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpiredPaymentScheduler {
    private final OrderRepository orderRepository;
    private final OrderCancellationService cancellationService;

    @Value("${payment.expire-minutes:15}")
    private long expireMinutes;

    @Scheduled(
            fixedDelayString = "${payment.expire-scan-ms:60000}",
            initialDelayString = "${payment.expire-initial-delay-ms:60000}"
    )
    public void cancelExpiredOnlineOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(expireMinutes);
        List<Order> expiredOrders =
                orderRepository.findAllByStatusAndPaymentMethodAndCreatedAtBefore("PENDING", "VIETQR", cutoff);

        for (Order order : expiredOrders) {
            try {
                boolean cancelled = cancellationService.cancelAndRestoreStock(
                        order.getId(),
                        "CANCELLED",
                        "Payment expired after " + expireMinutes + " minutes"
                );
                if (cancelled) {
                    log.info("Expired online order cancelled: orderId={}, orderCode={}",
                            order.getId(), order.getOrderCode());
                }
            } catch (RuntimeException exception) {
                log.error("Failed to cancel expired online order: orderId={}", order.getId(), exception);
            }
        }
    }
}
