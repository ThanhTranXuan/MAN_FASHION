package com.manfashion.springboot_be.DTO.Order;

import com.manfashion.springboot_be.DTO.Cart.CartItemRequest;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String paymentMethod;
    private String couponId;
    private List<CartItemRequest> items;
    private String checkoutSessionId;
}
