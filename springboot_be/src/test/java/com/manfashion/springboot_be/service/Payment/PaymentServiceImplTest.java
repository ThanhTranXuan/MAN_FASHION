package com.manfashion.springboot_be.service.Payment;

import com.manfashion.springboot_be.entity.Payment;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Payment.PaymentRepository;
import com.manfashion.springboot_be.service.Order.OrderCancellationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderCancellationService cancellationService;

    private PaymentServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PaymentServiceImpl(paymentRepository, orderRepository, cancellationService);
    }

    @Test
    void createsUnpaidCodPaymentRecord() {
        when(paymentRepository.findByOrderId(7)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Payment payment = service.createCodPayment(7, 250_000D);

        assertEquals("COD", payment.getPaymentMethod());
        assertEquals("UNPAID", payment.getPaymentStatus());
        assertEquals(250_000D, payment.getAmountVND());
    }

    @Test
    void failedOnlinePaymentUsesSharedCancellationFlow() {
        Payment payment = Payment.builder()
                .orderId(7)
                .paymentOrderCode(99L)
                .paymentStatus("PENDING")
                .build();
        when(paymentRepository.findByPaymentOrderCode(99L)).thenReturn(Optional.of(payment));

        service.markAsFailed(99L, "declined");

        verify(cancellationService).cancelAndRestoreStock(7, "FAILED", "declined");
    }
}
