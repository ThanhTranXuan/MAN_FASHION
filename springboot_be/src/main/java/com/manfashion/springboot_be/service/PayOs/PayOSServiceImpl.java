package com.manfashion.springboot_be.service.PayOs;

import com.manfashion.springboot_be.config.PayOSConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSServiceImpl implements PayOSService {

    private final PayOS payOS;
    private final PayOSConfig config;


    private static final AtomicLong sequence = new AtomicLong(System.currentTimeMillis() % 10000);

    @Override
    public PaymentResult createPaymentLink(String orderCode, double amountVND, List<PaymentLinkItem> items) {
        try {
            long paymentOrderCode = generateUniquePaymentOrderCode();

            CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                    .orderCode(paymentOrderCode)
                    .amount((long) Math.round(amountVND))
                    .description("Thanh toan don ")
                    .items(items != null && !items.isEmpty() ? items : List.of(

                            PaymentLinkItem.builder()
                                    .name("Trendify")
                                    .quantity(1)
                                    .price((long) Math.round(amountVND))
                                    .build()
                    ))
                    .returnUrl(config.getReturnUrl())
                    .cancelUrl(config.getCancelUrl())
                    .build();

            var response = payOS.paymentRequests().create(request);
            String checkoutUrl = response.getCheckoutUrl();
            String rawQr = response.getQrCode();

            String vietQrCodeUrl;
            if (rawQr != null && rawQr.startsWith("data:image")) {
                vietQrCodeUrl = rawQr;
            } else if (rawQr != null && rawQr.contains("qr.payos.vn")) {
                vietQrCodeUrl = rawQr;
            } else {

                vietQrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=" +
                        URLEncoder.encode(checkoutUrl, StandardCharsets.UTF_8);
            }

            return new PaymentResult(
                    orderCode,
                    paymentOrderCode,
                    checkoutUrl,
                    vietQrCodeUrl,
                    (long) Math.round(amountVND)
            );

        } catch (Exception e) {
            log.error("Lỗi khi tạo payment link với PayOS cho đơn {}: {}", orderCode, e.getMessage());

            throw new RuntimeException("Thanh toán tạm thời không khả dụng", e);
        }
    }

    private long generateUniquePaymentOrderCode() {
        return System.currentTimeMillis() * 1000 + sequence.incrementAndGet() % 1000;
    }
}
