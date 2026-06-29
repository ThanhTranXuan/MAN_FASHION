package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Order.OrderResponse;
import com.manfashion.springboot_be.entity.Order;
import com.manfashion.springboot_be.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {



    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "coupon.id", target = "couponId")
    @Mapping(source = "coupon.code", target = "couponCode")
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "qrCodeUrl", ignore = true)
    @Mapping(target = "paymentStatus", ignore = true)
    @Mapping(target = "paymentLink", ignore = true)
    @Mapping(target = "paidAt", ignore = true)
    OrderResponse toResponse(Order order);

    default OrderResponse toResponse(
            Order order,
            List<com.manfashion.springboot_be.DTO.Order.OrderItemResponse> items,
            Payment payment
    ) {
        OrderResponse response = toResponse(order);
        response.setItems(items);
        response.setPaymentStatus(payment != null
                ? payment.getPaymentStatus()
                : "COD".equals(order.getPaymentMethod()) ? "UNPAID" : "PENDING");

        if (payment != null) {
            response.setPaymentLink(payment.getPaymentLink());
            response.setQrCodeUrl(payment.getQrCodeUrl());
            response.setPaidAt(payment.getPaidAt());
        }
        return response;
    }
}
