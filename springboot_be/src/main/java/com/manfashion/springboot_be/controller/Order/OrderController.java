package com.manfashion.springboot_be.controller.Order;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Order.OrderRequest;
import com.manfashion.springboot_be.DTO.Order.OrderResponse;
import com.manfashion.springboot_be.service.Order.OrderService;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        return (principal instanceof String) ? (String) principal : null;
    }

    // 📃 GET all orders (ADMIN/EMPLOYEE)
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<Page<OrderResponse>> getAllOrders(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String status,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<OrderResponse> orders = orderService.getAllOrders(code, status, pageable);

        return ApiResponse.<Page<OrderResponse>>builder()
                .message("order.getAll.success")
                .data(orders)
                .build();
    }

    // 🔍 Check new orders
    @GetMapping("/has-new")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<Boolean> hasNewOrders(@RequestParam("since") long since) {

        boolean hasNew = orderService.hasNewOrdersAfter(since);

        return ApiResponse.<Boolean>builder()
                .message("order.checkNew.success")
                .data(hasNew)
                .build();
    }

    // 🛒 CREATE order
    @PostMapping
    @PreAuthorize("hasAnyAuthority('GUEST','USER','ADMIN','EMPLOYEE')")
    public ApiResponse<OrderResponse> createOrder(@RequestBody OrderRequest req) {

        String currentUserId = getCurrentUserId();
        Integer userId = currentUserId == null || "guest".equalsIgnoreCase(currentUserId)
                ? null
                : Integer.valueOf(currentUserId);
        OrderResponse response = orderService.createFromCart(userId, req);

        return ApiResponse.<OrderResponse>builder()
                .message("order.create.success")
                .data(response)
                .build();
    }

    // 📄 GET my orders
    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('USER','ADMIN','EMPLOYEE')")
    public ApiResponse<Page<OrderResponse>> getMyOrders(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Integer userId = Integer.valueOf(getCurrentUserId());
        Page<OrderResponse> orders = orderService.getOrdersByUserId(userId, pageable);

        return ApiResponse.<Page<OrderResponse>>builder()
                .message("order.getMy.success")
                .data(orders)
                .build();
    }

    // 🔄 UPDATE status
    @PatchMapping("/{orderCode}/status")
    @PreAuthorize("hasAnyAuthority('USER','EMPLOYEE','ADMIN')")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable String orderCode,
            @RequestParam String status) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = getCurrentUserId();

        boolean isSelfServiceUpdate = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("USER"));

        OrderResponse updated;

        if (isSelfServiceUpdate) {
            updated = orderService.updateStatusByUser(Integer.valueOf(userId), orderCode, status);
        } else {
            updated = orderService.updateStatus(orderCode, status);
        }

        return ApiResponse.<OrderResponse>builder()
                .message("order.updateStatus.success")
                .data(updated)
                .build();
    }

    // ❌ Cancel order
    @PatchMapping("/cancel/{orderCode}")
    @PreAuthorize("hasAnyAuthority('USER','ADMIN','EMPLOYEE')")
    public ApiResponse<String> cancelOrder(@PathVariable String orderCode) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isCustomer = auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("USER"));
        if (isCustomer) {
            orderService.cancelPendingOrderByUser(Integer.valueOf(getCurrentUserId()), orderCode);
        } else {
            orderService.cancelPendingOrder(orderCode);
        }

        return ApiResponse.<String>builder()
                .message("order.cancel.success")
                .data("Order cancelled successfully")
                .build();
    }
}
