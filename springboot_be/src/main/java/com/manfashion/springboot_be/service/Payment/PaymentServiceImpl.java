package com.manfashion.springboot_be.service.Payment;

import com.manfashion.springboot_be.entity.Payment;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Payment.PaymentRepository;
import com.manfashion.springboot_be.service.Order.OrderCancellationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepo;
    private final OrderRepository orderRepo;
    private final OrderCancellationService cancellationService;

    @Override
    @Transactional
    public Payment createPayment(Integer orderId,
                                 Long paymentOrderCode,
                                 String checkoutUrl,
                                 String qrCodeUrl,
                                 Double amountVND) {


        if (paymentRepo.existsByPaymentOrderCode(paymentOrderCode)) {
            log.warn("Payment đã tồn tại với paymentOrderCode: {}", paymentOrderCode);
            return paymentRepo.findByPaymentOrderCode(paymentOrderCode)
                    .orElseThrow(() -> new RuntimeException("Payment existed but not found"));
        }

        Payment payment = Payment.builder()
                .orderId(orderId)
                .paymentOrderCode(paymentOrderCode)
                .paymentLink(checkoutUrl)
                .qrCodeUrl(qrCodeUrl)
                .amountVND(amountVND)
                .paymentStatus("PENDING")
                .paymentMethod("VIETQR")
                .createdAt(LocalDateTime.now())
                .build();

        Payment saved = paymentRepo.save(payment);
        log.info("Tạo Payment thành công → orderCode: {}, paymentOrderCode: {}", orderId, paymentOrderCode);
        return saved;
    }

    @Override
    @Transactional
    public Payment createCodPayment(Integer orderId, Double amountVND) {
        return paymentRepo.findByOrderId(orderId).orElseGet(() ->
                paymentRepo.save(Payment.builder()
                        .orderId(orderId)
                        .amountVND(amountVND)
                        .paymentStatus("UNPAID")
                        .paymentMethod("COD")
                        .description("Thanh toán khi nhận hàng")
                        .createdAt(LocalDateTime.now())
                        .build())
        );
    }

    @Override
    @Transactional
    public PaymentMarkResult markAsPaid(Long paymentOrderCode, String transactionId) {
        var optionalPayment = paymentRepo.findByPaymentOrderCode(paymentOrderCode);

        if (optionalPayment.isEmpty()) {
            log.warn("PayOS webhook - Payment not found for paymentOrderCode: {}", paymentOrderCode);
            return null;
        }

        Integer orderId = optionalPayment.get().getOrderId();
        var optionalOrder = orderRepo.findByIdForUpdate(orderId);
        if (optionalOrder.isEmpty()) {
            log.error("Không tìm thấy Order với orderId: {}", orderId);
            return null;
        }

        Payment payment = paymentRepo.findByOrderIdForUpdate(orderId)
                .orElse(optionalPayment.get());

        if ("PAID".equals(payment.getPaymentStatus())) {
            log.info("PayOS webhook - Payment {} đã được xử lý trước đó (PAID), bỏ qua", paymentOrderCode);
            return new PaymentMarkResult(payment, false);
        }
        if ("CANCELLED".equals(optionalOrder.get().getStatus())
                || "FAILED".equals(payment.getPaymentStatus())
                || "CANCELLED".equals(payment.getPaymentStatus())) {
            log.warn("Ignore late PAID webhook for closed payment: paymentOrderCode={}, status={}",
                    paymentOrderCode, payment.getPaymentStatus());
            return new PaymentMarkResult(payment, false);
        }

        payment.setPaymentStatus("PAID");
        payment.setTransactionId(transactionId);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepo.save(payment);

        var order = optionalOrder.get();
        order.setStatus("PAID");
        orderRepo.save(order);
        log.info("Cập nhật trạng thái đơn hàng {} → PAID", payment.getOrderId());

        log.info("Thanh toán thành công → paymentOrderCode: {}, transactionId: {}", paymentOrderCode, transactionId);
        return new PaymentMarkResult(payment, true);
    }

    @Override
    @Transactional
    public void markAsFailed(Long paymentOrderCode, String reason) {
        paymentRepo.findByPaymentOrderCode(paymentOrderCode)
                .ifPresentOrElse(
                        payment -> {
                            if ("PAID".equals(payment.getPaymentStatus())
                                    || "FAILED".equals(payment.getPaymentStatus())
                                    || "CANCELLED".equals(payment.getPaymentStatus())) {
                                log.info("Payment đã được đánh dấu thất bại trước đó → paymentOrderCode: {}", paymentOrderCode);
                                return;
                            }
                            cancellationService.cancelAndRestoreStock(
                                    payment.getOrderId(), "FAILED", reason
                            );
                        },
                        () -> log.warn("Không tìm thấy Payment để đánh dấu FAILED → paymentOrderCode: {}", paymentOrderCode)
                );
    }

    @Override
    @Transactional
    public void markCodAsPaid(Integer orderId) {
        paymentRepo.findByOrderId(orderId).ifPresent(payment -> {
            if ("COD".equals(payment.getPaymentMethod()) && !"PAID".equals(payment.getPaymentStatus())) {
                payment.setPaymentStatus("PAID");
                payment.setPaidAt(LocalDateTime.now());
                paymentRepo.save(payment);
            }
        });
    }
}
