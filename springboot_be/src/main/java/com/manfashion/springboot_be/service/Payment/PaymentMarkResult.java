package com.manfashion.springboot_be.service.Payment;

import com.manfashion.springboot_be.entity.Payment;

public record PaymentMarkResult(Payment payment, boolean newlyPaid) {
}
