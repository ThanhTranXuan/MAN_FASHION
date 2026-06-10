package com.manfashion.springboot_be.service.Payment;

import com.manfashion.springboot_be.entity.Order;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.service.Order.OrderCancellationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpiredPaymentSchedulerTest {
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderCancellationService cancellationService;

    @Test
    void scansOnlyPendingVietQrOrdersAndCancelsExpiredOrder() {
        Order order = Order.builder().id(5).orderCode("ORD-5").build();
        when(orderRepository.findAllByStatusAndPaymentMethodAndCreatedAtBefore(
                eq("PENDING"), eq("VIETQR"), any(LocalDateTime.class)
        )).thenReturn(List.of(order));
        when(cancellationService.cancelAndRestoreStock(
                eq(5), eq("CANCELLED"), any(String.class)
        )).thenReturn(true);

        ExpiredPaymentScheduler scheduler =
                new ExpiredPaymentScheduler(orderRepository, cancellationService);
        ReflectionTestUtils.setField(scheduler, "expireMinutes", 15L);

        scheduler.cancelExpiredOnlineOrders();

        verify(cancellationService).cancelAndRestoreStock(
                eq(5), eq("CANCELLED"), any(String.class)
        );
    }
}
