package com.manfashion.springboot_be.repository.Order;

import com.manfashion.springboot_be.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface OrderRepositoryCustom {
    Page<Order> searchOrders(String keyword, String status, String paymentMethod,
                             LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);
}
