package com.manfashion.springboot_be.controller.Payment;

import com.manfashion.springboot_be.entity.Order;
import com.manfashion.springboot_be.entity.Payment;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.service.Cart.CartService;
import com.manfashion.springboot_be.service.Payment.PaymentService;
import com.manfashion.springboot_be.util.EmailTemplateBuilder;
import com.manfashion.springboot_be.util.SendMail;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.payos.PayOS;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payos/webhook")
@RequiredArgsConstructor
@Slf4j
public class PayOSWebhookController {

    private final PayOS payOS;
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final SendMail sendMail;
    private final SimpMessagingTemplate messaging;

    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody Webhook webhook) {
        try {
            WebhookData data = payOS.webhooks().verify(webhook);

            Long paymentOrderCode = data.getOrderCode();
            String code = data.getCode(); // "00" = thành công
            String desc = data.getDesc();

            log.info("PayOS Webhook → paymentOrderCode: {}, code: {}, desc: {}", paymentOrderCode, code, desc);

            if ("00".equals(code)) {
                String transactionId = data.getReference();

                Payment payment = paymentService.markAsPaid(paymentOrderCode, transactionId);

                if (payment == null) {
                    log.warn("Webhook PayOS: không tìm thấy Payment cho paymentOrderCode {}, bỏ qua.", paymentOrderCode);
                    return ResponseEntity.ok("OK");
                }

                Order order = orderRepository.findById(payment.getOrderId()).orElse(null);
                if (order == null) {
                    log.warn("Không tìm thấy đơn hàng với id: {}", payment.getOrderId());
                    return ResponseEntity.ok("OK");
                }

                // XÓA GIỎ HÀNG
                // Kiểm tra 2 lớp: Order có chứa thông tin User không? Và User đó có ID không?
                if (order.getUser() != null && order.getUser().getId() != null) {
                    try {
                        // 1. Lấy ID an toàn (đi vòng qua object User)
                        String currentUserId = order.getUser().getId().toString();

                        // 2. Thực thi xóa
                        cartService.clear(currentUserId);
                        log.info("Đã xóa giỏ hàng user {}", currentUserId);

                    } catch (Exception e) {
                        // 3. Catch lỗi nhưng KHÔNG throw (ném) ra ngoài, để luồng thanh toán vẫn đi tiếp
                        log.error("Lỗi xóa giỏ hàng cho user {}: {}", order.getUser().getId(), e.getMessage());
                    }
                } else {
                    log.warn("Bỏ qua bước xóa giỏ hàng do Đơn hàng {} không liên kết với User nào.", order.getId());
                }

                // PUSH REALTIME CHO ADMIN
                messaging.convertAndSend("/topic/new-order", (Object) Map.of(
                        "code", order.getOrderCode(),
                        "total", order.getFinalTotal(),
                        "customer", Optional.ofNullable(order.getFullName()).filter(s -> !s.isBlank()).orElse("Khách lẻ"),
                        "phone", order.getPhone(),
                        "timestamp", System.currentTimeMillis(),
                        "type", "PAID"
                ));

                // GỬI EMAIL XÁC NHẬN
                sendSuccessEmail(order);

                log.info("ĐƠN HÀNG {} ĐÃ THANH TOÁN THÀNH CÔNG!", order.getOrderCode());
            } else {
                paymentService.markAsFailed(paymentOrderCode, desc);
                log.warn("Thanh toán thất bại → paymentOrderCode: {}, lý do: {}", paymentOrderCode, desc);
            }

            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            // ❗ QUAN TRỌNG: KHÔNG TRẢ 400 NỮA
            log.error("Lỗi xử lý webhook PayOS", e);
            // Trả 200 để PayOS không coi webhook là "chết"
            return ResponseEntity.ok("OK");
        }
    }

    private void sendSuccessEmail(Order order) {
        String customerName = Optional.ofNullable(order.getFullName())
                .filter(name -> !name.isBlank())
                .orElse(order.getEmail().split("@")[0]);

        long amountVND = Math.round(order.getFinalTotal());

        String htmlContent = EmailTemplateBuilder.build(
                customerName,
                "Thanh toán thành công - Đơn hàng " + order.getOrderCode(),
                """
                        <h2>Xin chào <b>%s</b>!</h2>
                        <p>Chúng tôi đã nhận được thanh toán thành công cho đơn hàng <b style="color:#38A169;">%s</b></p>
                        <p><strong>Số tiền:</strong> <span style="font-size:1.4em; color:#38A169; font-weight:bold;">%,d VNĐ</span></p>
                        <p>Đơn hàng đang được xử lý và sẽ giao trong vòng <b>24-48 giờ</b>.</p>
                        <p>Cảm ơn bạn đã tin tưởng <b>Trendify</b>!</p>
                        """.formatted(customerName, order.getOrderCode(), amountVND),
                "Xem chi tiết đơn hàng",
                "http://localhost:3000/user/profile"
        );

        boolean sent = sendMail.sendMail(
                order.getEmail(),
                "Trendify - Thanh toán thành công đơn hàng " + order.getOrderCode(),
                htmlContent
        );

        if (sent) {
            log.info("Gửi email xác nhận thành công tới: {}", order.getEmail());
        } else {
            log.warn("Gửi email thất bại cho đơn: {}", order.getOrderCode());
        }
    }
}
