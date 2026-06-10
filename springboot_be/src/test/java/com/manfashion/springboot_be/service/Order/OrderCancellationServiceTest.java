package com.manfashion.springboot_be.service.Order;

import com.manfashion.springboot_be.entity.Order;
import com.manfashion.springboot_be.entity.OrderItem;
import com.manfashion.springboot_be.entity.Payment;
import com.manfashion.springboot_be.entity.ProductVariant;
import com.manfashion.springboot_be.repository.Order.OrderItemRepository;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Payment.PaymentRepository;
import com.manfashion.springboot_be.repository.Product.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderCancellationServiceTest {
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private PaymentRepository paymentRepository;

    private OrderCancellationService service;

    @BeforeEach
    void setUp() {
        service = new OrderCancellationService(
                orderRepository, orderItemRepository, variantRepository, paymentRepository
        );
    }

    @Test
    void cancelsPendingOrderAndRestoresStockOnce() {
        Order order = Order.builder()
                .id(10)
                .orderCode("ORD-10")
                .status("PENDING")
                .stockRestored(false)
                .build();
        ProductVariant variant = ProductVariant.builder().id(20).build();
        OrderItem item = OrderItem.builder().variant(variant).quantity(2).build();
        Payment payment = Payment.builder().orderId(10).paymentStatus("PENDING").build();

        when(orderRepository.findByIdForUpdate(10)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderIdForUpdate(10)).thenReturn(Optional.of(payment));
        when(orderItemRepository.findByOrderId(10)).thenReturn(List.of(item));

        assertTrue(service.cancelAndRestoreStock(10, "FAILED", "gateway failed"));

        verify(variantRepository).incrementStock(20, 2);
        assertTrue(order.getStockRestored());
        assertEquals("CANCELLED", order.getStatus());
        assertEquals("FAILED", payment.getPaymentStatus());
        assertEquals("gateway failed", payment.getFailureReason());
    }

    @Test
    void repeatedCancellationDoesNotRestoreStockAgain() {
        Order order = Order.builder()
                .id(10)
                .orderCode("ORD-10")
                .status("CANCELLED")
                .stockRestored(true)
                .build();
        when(orderRepository.findByIdForUpdate(10)).thenReturn(Optional.of(order));

        assertFalse(service.cancelAndRestoreStock(10, "FAILED", "duplicate"));

        verify(orderItemRepository, never()).findByOrderId(10);
        verify(variantRepository, never()).incrementStock(20, 2);
    }

    @Test
    void paidPaymentIsNeverCancelledOrRestored() {
        Order order = Order.builder()
                .id(10)
                .orderCode("ORD-10")
                .status("PENDING")
                .stockRestored(false)
                .build();
        Payment payment = Payment.builder().orderId(10).paymentStatus("PAID").build();
        when(orderRepository.findByIdForUpdate(10)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderIdForUpdate(10)).thenReturn(Optional.of(payment));

        assertFalse(service.cancelAndRestoreStock(10, "FAILED", "late failure"));

        verify(orderItemRepository, never()).findByOrderId(10);
    }
}
