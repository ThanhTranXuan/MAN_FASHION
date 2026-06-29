package com.manfashion.springboot_be.service.Payment;

import com.manfashion.springboot_be.entity.Payment;

public interface PaymentService {



    Payment createPayment(Integer orderId,
                          Long paymentOrderCode,
                          String checkoutUrl,
                          String qrCodeUrl,
                          Double amountVND);

    Payment createCodPayment(Integer orderId, Double amountVND);




    PaymentMarkResult markAsPaid(Long paymentOrderCode, String transactionId);




    void markAsFailed(Long paymentOrderCode, String reason);

    void markCodAsPaid(Integer orderId);
}
