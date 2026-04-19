package com.manfashion.springboot_be.service.PayOs;

import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

import java.util.List;

public interface PayOSService {
    /**
     * Tạo link thanh toán qua cổng PayOS
     */
    PaymentResult createPaymentLink(String orderCode, double amountVND, List<PaymentLinkItem> items);

    /**
     * DTO chứa kết quả trả về sau khi tạo link thành công
     */
    record PaymentResult(
            String orderCode,
            Long paymentOrderCode,
            String checkoutUrl,
            String qrCodeUrl,
            long finalTotal
    ) {}
}
