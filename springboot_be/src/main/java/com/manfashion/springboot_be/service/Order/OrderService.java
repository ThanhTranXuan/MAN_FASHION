package com.manfashion.springboot_be.service.Order;

import com.manfashion.springboot_be.DTO.Order.OrderRequest;
import com.manfashion.springboot_be.DTO.Order.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    // ================== NGHIỆP VỤ USER ==================

    OrderResponse createFromCart(Integer userId, OrderRequest req);

    Page<OrderResponse> getOrdersByUserId(Integer userId, Pageable pageable);

    OrderResponse updateStatusByUser(Integer userId, String orderCode, String status);

    void cancelPendingOrder(String orderCode);
    void cancelPendingOrderByUser(Integer userId, String orderCode);

    // ================== NGHIỆP VỤ ADMIN ==================

    OrderResponse updateStatus(String orderCode, String status);

    Page<OrderResponse> getAllOrders(String code, String status, Pageable pageable);

    boolean hasNewOrdersAfter(long sinceMillis);
}
