package com.manfashion.springboot_be.service.PayOs;

import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

import java.util.List;

public interface PayOSService {



    PaymentResult createPaymentLink(String orderCode, double amountVND, List<PaymentLinkItem> items);




    record PaymentResult(
            String orderCode,
            Long paymentOrderCode,
            String checkoutUrl,
            String qrCodeUrl,
            long finalTotal
    ) {}
}
