package com.manfashion.springboot_be.service.Payment;

import com.manfashion.springboot_be.entity.Payment;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Payment.PaymentRepository;
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

    @Override
    @Transactional
    public Payment createPayment(Integer orderId,
                                 Long paymentOrderCode,
                                 String checkoutUrl,
                                 String qrCodeUrl,
                                 Double amountVND) {

        // Kiểm tra trùng lặp (tránh tạo 2 lần nếu retry)
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
                .createdAt(LocalDateTime.now())
                .build();

        Payment saved = paymentRepo.save(payment);
        log.info("Tạo Payment thành công → orderCode: {}, paymentOrderCode: {}", orderId, paymentOrderCode);
        return saved;
    }

    @Override
    @Transactional
    public PaymentMarkResult markAsPaid(Long paymentOrderCode, String transactionId) {
        var optionalPayment = paymentRepo.findByPaymentOrderCode(paymentOrderCode);

        if (optionalPayment.isEmpty()) {
            log.warn("PayOS webhook - Payment not found for paymentOrderCode: {}", paymentOrderCode);
            return null;
        }

        Payment payment = optionalPayment.get();

        if ("PAID".equals(payment.getPaymentStatus())) {
            log.info("PayOS webhook - Payment {} đã được xử lý trước đó (PAID), bỏ qua", paymentOrderCode);
            return new PaymentMarkResult(payment, false);
        }

        payment.setPaymentStatus("PAID");
        payment.setTransactionId(transactionId);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepo.save(payment);

        orderRepo.findById(payment.getOrderId())
                .ifPresentOrElse(
                        order -> {
                            order.setStatus("PAID");
                            orderRepo.save(order);
                            log.info("Cập nhật trạng thái đơn hàng {} → PAID", payment.getOrderId());
                        },
                        () -> log.error("Không tìm thấy Order với orderId: {}", payment.getOrderId())
                );

        log.info("Thanh toán thành công → paymentOrderCode: {}, transactionId: {}", paymentOrderCode, transactionId);
        return new PaymentMarkResult(payment, true);
    }

    @Override
    @Transactional
    public void markAsFailed(Long paymentOrderCode, String reason) {
        paymentRepo.findByPaymentOrderCode(paymentOrderCode)
                .ifPresentOrElse(
                        payment -> {
                            if ("FAILED".equals(payment.getPaymentStatus()) || "CANCELLED".equals(payment.getPaymentStatus())) {
                                log.info("Payment đã được đánh dấu thất bại trước đó → paymentOrderCode: {}", paymentOrderCode);
                                return;
                            }

                            payment.setPaymentStatus("FAILED");
                            payment.setFailureReason(reason);
                            paymentRepo.save(payment);

                            orderRepo.findById(payment.getOrderId())
                                    .ifPresent(order -> {
                                        order.setStatus("CANCELLED");
                                        orderRepo.save(order);
                                        log.info("Đơn hàng {} đã bị hủy do thanh toán thất bại", payment.getOrderId());
                                    });
                        },
                        () -> log.warn("Không tìm thấy Payment để đánh dấu FAILED → paymentOrderCode: {}", paymentOrderCode)
                );
    }
}
