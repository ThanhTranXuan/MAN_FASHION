package com.manfashion.springboot_be.service.Order;

import com.manfashion.springboot_be.DTO.Cart.CartItemRequest;
import com.manfashion.springboot_be.DTO.Order.OrderRequest;
import com.manfashion.springboot_be.DTO.Order.OrderResponse;
import com.manfashion.springboot_be.entity.*;
import com.manfashion.springboot_be.mapper.OrderItemMapper;
import com.manfashion.springboot_be.mapper.OrderMapper;
import com.manfashion.springboot_be.repository.Coupon.CouponRepository;
import com.manfashion.springboot_be.repository.Order.OrderItemRepository;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Payment.PaymentRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Product.ProductVariantRepository;
import com.manfashion.springboot_be.util.CodeGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;


@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final ProductRepository productRepo;
    private final ProductVariantRepository variantRepo;
    private final CouponRepository couponRepo;
    private final PaymentRepository paymentRepo;

    private final CodeGenerator codeGenerator;

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    // =====================================================
    // CREATE ORDER
    // =====================================================
    @Override
    @Transactional
    public OrderResponse createFromCart(String userIdStr, OrderRequest req) {

        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Integer userId = Integer.parseInt(userIdStr);

        double subtotal = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItemRequest ci : req.getItems()) {

            Integer productId = Integer.parseInt(ci.getProductId());
            Integer variantId = Integer.parseInt(ci.getVariantId());

            ProductVariant variant = variantRepo.findById(variantId)
                    .orElseThrow(() -> new RuntimeException("Variant not found"));

            int stock = Optional.ofNullable(variant.getStock()).orElse(0);
            if (stock < ci.getQuantity()) {
                throw new RuntimeException("Not enough stock");
            }

            variant.setStock(stock - ci.getQuantity());
            variantRepo.save(variant);

            double price = getProductPrice(productId);
            subtotal += price * ci.getQuantity();

            orderItems.add(OrderItem.builder()
                    .product(Product.builder().id(productId).build())
                    .variant(variant)
                    .quantity(ci.getQuantity())
                    .price(price)
                    .build());
        }

        // ===== COUPON =====
        double discountPercent = 0;
        double discountValue = 0;
        Coupon appliedCoupon = null;

        if (req.getCouponId() != null && !req.getCouponId().isBlank()) {
            Integer parsedCouponId = Integer.parseInt(req.getCouponId());

            appliedCoupon = couponRepo.findById(parsedCouponId)
                    .orElseThrow(() -> new RuntimeException("Invalid coupon"));

            discountPercent = Optional.ofNullable(appliedCoupon.getDiscountValue()).orElse(0.0);
            discountValue = subtotal * discountPercent / 100;
        }

        double finalTotal = subtotal - discountValue;

        // ===== CREATE ORDER =====
        Order order = Order.builder()
                .orderCode(generateCode())
                .user(User.builder().id(userId).build())
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .coupon(appliedCoupon)
                .subtotal(subtotal)
                .discountPercent(discountPercent)
                .discountValue(discountValue)
                .finalTotal(finalTotal)
                .status("PENDING")
                .paymentMethod(req.getPaymentMethod())
                .createdAt(LocalDateTime.now())
                .build();

        orderRepo.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            orderItemRepo.save(item);
        }

        return buildResponse(order, orderItems);
    }

    // =====================================================
    // UPDATE STATUS (ADMIN)
    // =====================================================
    @Override
    @Transactional
    public OrderResponse updateStatus(String orderCode, String status) {

        Order order = orderRepo.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);

        if ("DELIVERED".equalsIgnoreCase(status)) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        orderRepo.save(order);

        return buildResponse(order, orderItemRepo.findByOrderId(order.getId()));
    }

    // =====================================================
    // UPDATE STATUS (USER)
    // =====================================================
    @Override
    @Transactional
    public OrderResponse updateStatusByUser(String userIdStr, String orderCode, String status) {

        Integer userId = Integer.parseInt(userIdStr);

        Order order = orderRepo.findByOrderCodeAndUserId(orderCode, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Set<String> allowed = Set.of("COMPLETED", "RETURN");
        if (!allowed.contains(status.toUpperCase())) {
            throw new RuntimeException("Invalid status");
        }

        order.setStatus(status.toUpperCase());
        orderRepo.save(order);

        return buildResponse(order, orderItemRepo.findByOrderId(order.getId()));
    }

    // =====================================================
    // GET ALL (ADMIN)
    // =====================================================
    @Override
    public Page<OrderResponse> getAllOrders(String code, String status, Pageable pageable) {

        // Gọi đúng tên hàm searchOrders và truyền đủ 6 tham số (các tham số rỗng truyền null)
        Page<Order> page = orderRepo.searchOrders(code, status, null, null, null, pageable);

        return page.map(o ->
                buildResponse(o, orderItemRepo.findByOrderId(o.getId()))
        );
    }

    // =====================================================
    // GET MY ORDERS
    // =====================================================
    @Override
    public Page<OrderResponse> getOrdersByUserId(String userIdStr, Pageable pageable) {

        Integer userId = Integer.parseInt(userIdStr);

        return orderRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(o -> buildResponse(o, orderItemRepo.findByOrderId(o.getId())));
    }

    // =====================================================
    // CHECK NEW
    // =====================================================
    @Override
    public boolean hasNewOrdersAfter(long sinceMillis) {

        if (sinceMillis <= 0) return false;

        LocalDateTime since = Instant.ofEpochMilli(sinceMillis)
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        return orderRepo.existsByCreatedAtAfter(since);
    }

    // =====================================================
    // CANCEL
    // =====================================================
    @Override
    @Transactional
    public void cancelPendingOrder(String orderCode) {

        Order order = orderRepo.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Only PENDING can cancel");
        }

        order.setStatus("CANCELLED");
        orderRepo.save(order);

        List<OrderItem> items = orderItemRepo.findByOrderId(order.getId());

        for (OrderItem item : items) {
            variantRepo.findById(item.getVariant().getId()).ifPresent(v -> {
                v.setStock(v.getStock() + item.getQuantity());
                variantRepo.save(v);
            });
        }
    }

    // =====================================================
    // HELPER
    // =====================================================
    private OrderResponse buildResponse(Order order, List<OrderItem> items) {

        OrderResponse response = orderMapper.toResponse(order);

        response.setItems(
                items.stream()
                        .map(orderItemMapper::toResponse)
                        .toList()
        );

        Payment payment = paymentRepo.findByOrderId(order.getId()).orElse(null);

        if (payment != null) {
            response.setPaymentLink(payment.getPaymentLink());
            response.setQrCodeUrl(payment.getQrCodeUrl());
            response.setPaymentStatus(payment.getPaymentStatus());
            response.setPaidAt(payment.getPaidAt());
        }

        return response;
    }

    private Long parseLong(String id) {
        return (id != null && !id.isBlank()) ? Long.parseLong(id) : null;
    }

    private String generateCode() {
        String code;
        do {
            code = codeGenerator.generate();
        } while (orderRepo.existsByOrderCode(code));
        return code;
    }

    private double getProductPrice(Integer productId) {
        return productRepo.findById(productId)
                .map(Product::getPrice)
                .orElse(0.0);
    }
}
