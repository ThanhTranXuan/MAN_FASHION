package com.manfashion.springboot_be.service.Payment;

import com.manfashion.springboot_be.entity.Payment;

public interface PaymentService {
    /**
     * Tạo mới một phiên thanh toán cho đơn hàng
     */
    Payment createPayment(Integer orderId,
                          Long paymentOrderCode,
                          String checkoutUrl,
                          String qrCodeUrl,
                          Double amountVND);

    /**
     * Xử lý webhook: Đánh dấu thanh toán thành công và cập nhật đơn hàng
     */
    Payment markAsPaid(Long paymentOrderCode, String transactionId);

    /**
     * Xử lý webhook/timeout: Đánh dấu thanh toán thất bại và hủy đơn hàng
     */
    void markAsFailed(Long paymentOrderCode, String reason);

}
