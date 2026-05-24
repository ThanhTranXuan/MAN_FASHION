package com.manfashion.springboot_be.service.Order;

import com.manfashion.springboot_be.DTO.Cart.CartItemRequest;
import com.manfashion.springboot_be.DTO.Order.OrderItemResponse;
import com.manfashion.springboot_be.DTO.Order.OrderRequest;
import com.manfashion.springboot_be.DTO.Order.OrderResponse;
import com.manfashion.springboot_be.entity.*;
import com.manfashion.springboot_be.mapper.OrderItemMapper;
import com.manfashion.springboot_be.mapper.OrderMapper;
import com.manfashion.springboot_be.repository.Coupon.CouponRepository;
import com.manfashion.springboot_be.repository.Order.OrderItemRepository;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Payment.PaymentRepository;
import com.manfashion.springboot_be.repository.Product.ProductImageRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Product.ProductVariantRepository;
import com.manfashion.springboot_be.service.PayOs.PayOSService;
import com.manfashion.springboot_be.service.Payment.PaymentService;
import com.manfashion.springboot_be.util.CodeGenerator;
import com.manfashion.springboot_be.util.EmailTemplateBuilder;
import com.manfashion.springboot_be.util.SendMail;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

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
    private final ProductImageRepository productImageRepo;
    private final ProductVariantRepository variantRepo;
    private final CouponRepository couponRepo;
    private final PaymentRepository paymentRepo;
    private final SendMail sendMail;
    private final CodeGenerator codeGenerator;
    private final PayOSService payOSService;
    private final PaymentService paymentService;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;


    @Override
    @Transactional
    public OrderResponse createFromCart(Integer userId, OrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        String checkoutSessionId = req.getCheckoutSessionId();

        if ("VIETQR".equals(req.getPaymentMethod()) && checkoutSessionId != null && !checkoutSessionId.isBlank()) {
            Optional<Order> existingPending = orderRepo.findTopByCheckoutSessionIdAndStatusAndPaymentMethodAndCreatedAtAfter(
                    checkoutSessionId, "PENDING", "VIETQR", LocalDateTime.now().minusMinutes(20)
            );

            if (existingPending.isPresent()) {
                Order order = existingPending.get();
                log.info("Tái sử dụng đơn cũ cho checkoutSessionId: {} → orderCode: {}", checkoutSessionId, order.getOrderCode());

                List<OrderItem> items = orderItemRepo.findByOrderId(order.getId());
                OrderResponse response = toResponse(order, items);

                if (response.getPaymentLink() != null) {
                    return response;
                }
            }
        }

        double subtotal = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();
        List<PaymentLinkItem> itemsForPayOS = new ArrayList<>();

        for (CartItemRequest ci : req.getItems()) {
            Integer productId = Integer.valueOf(ci.getProductId());
            Integer variantId = Integer.valueOf(ci.getVariantId());

            ProductVariant variant = variantRepo.findById(variantId)
                    .orElseThrow(() -> new RuntimeException("Variant not found"));

            if (variant.getDeletedAt() != null) {
                throw new RuntimeException("Variant is no longer available");
            }

            // SỬA Ở ĐÂY: Dùng getProduct().getId()
            if (!variant.getProduct().getId().equals(productId)) {
                throw new RuntimeException("Variant does not belong to the specified product");
            }

            int quantity = ci.getQuantity();
            int currentStock = variant.getStock() == null ? 0 : variant.getStock();
            if (currentStock < quantity) {
                throw new RuntimeException("Not enough stock for product variant: " + variantId);
            }

            variant.setStock(currentStock - quantity);
            variantRepo.save(variant);

            double priceVND = getProductPrice(productId);
            subtotal += quantity * priceVND;

            // SỬA Ở ĐÂY: Dùng Object Product và Variant
            orderItems.add(OrderItem.builder()
                    .product(Product.builder().id(productId).build())
                    .variant(variant)
                    .quantity(quantity)
                    .price(priceVND)
                    .build());

            itemsForPayOS.add(PaymentLinkItem.builder()
                    .name("Sản phẩm Trendify")
                    .quantity(quantity)
                    .price((long) Math.round(priceVND))
                    .build());
        }

        double discountPercent = 0.0;
        double discountValue = 0.0;
        Coupon appliedCoupon = null; // Tạo biến lưu object Coupon

        if (req.getCouponId() != null && !req.getCouponId().isBlank()) {
            Integer couponId = Integer.valueOf(req.getCouponId());
            appliedCoupon = couponRepo.findById(couponId)
                    .orElseThrow(() -> new RuntimeException("Invalid coupon"));

            LocalDateTime now = LocalDateTime.now();
            if ((appliedCoupon.getStartDate() != null && now.isBefore(appliedCoupon.getStartDate()))
                    || (appliedCoupon.getEndDate() != null && now.isAfter(appliedCoupon.getEndDate()))) {
                throw new RuntimeException("Coupon invalid or expired");
            }

            discountPercent = Optional.ofNullable(appliedCoupon.getDiscountValue()).orElse(0.0);
            discountValue = subtotal * discountPercent / 100.0;

            Integer usedCount = appliedCoupon.getUsedCount() == null ? 0 : appliedCoupon.getUsedCount();
            appliedCoupon.setUsedCount(usedCount + 1);
            couponRepo.save(appliedCoupon);
        }

        double finalTotal = subtotal - discountValue;
        long amountVND = Math.round(finalTotal);

        String paymentMethod = req.getPaymentMethod();
        if (!"VIETQR".equals(paymentMethod) && !"COD".equals(paymentMethod)) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ");
        }

        String orderCode = generateUniqueDisplayCode();

        // SỬA Ở ĐÂY: Truyền Object User và Coupon vào
        Order order = Order.builder()
                .orderCode(orderCode)
                .user(User.builder().id(userId).build())
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .coupon(appliedCoupon)
                .discountPercent(discountPercent)
                .discountValue(discountValue)
                .subtotal(subtotal)
                .finalTotal(finalTotal)
                .status("PENDING")
                .paymentMethod(paymentMethod)
                .checkoutSessionId(checkoutSessionId)
                .createdAt(LocalDateTime.now())
                .build();

        orderRepo.save(order);

        for (OrderItem oi : orderItems) {
            // SỬA Ở ĐÂY: Map Object Order thay vì ID
            oi.setOrder(order);
            orderItemRepo.save(oi);
        }

        if ("COD".equals(paymentMethod)) {
            String successMessage = """
                <p>Đơn hàng của bạn đã được đặt thành công!</p>
                <p>Mã đơn hàng: <b>%s</b></p>
                <p>Tổng tiền: <b>%,d VNĐ</b></p>
                <p>Chúng tôi sẽ liên hệ xác nhận và giao hàng trong vòng 24h.</p>
                """.formatted(orderCode, amountVND);

            String html = EmailTemplateBuilder.build(
                    customerName(order), "Trendify - Đặt hàng thành công " + orderCode, successMessage, "Xem đơn hàng", "http://localhost:3000/user/profile"
            );
            sendMail.sendMail(order.getEmail(), "Trendify - Đặt hàng thành công " + orderCode, html);
            return toResponse(order, orderItems);
        }

        PayOSService.PaymentResult payResult;
        try {
            payResult = payOSService.createPaymentLink(orderCode, amountVND, itemsForPayOS);
        } catch (Exception e) {
            rollbackStock(orderItems);
            throw new RuntimeException("Thanh toán tạm thời không khả dụng. Vui lòng thử lại sau.", e);
        }

        paymentService.createPayment(
                order.getId(),
                payResult.paymentOrderCode(),
                payResult.checkoutUrl(),
                payResult.qrCodeUrl(),
                (double) amountVND
        );

        sendPendingPaymentEmail(order, payResult.checkoutUrl(), payResult.qrCodeUrl());

        return toResponse(order, orderItems);
    }

    @Override
    public Page<OrderResponse> getOrdersByUserId(Integer userId, Pageable pageable) {
        Page<Order> page = orderRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(o -> toResponse(o, orderItemRepo.findByOrderId(o.getId())));
    }

    @Override
    @Transactional
    public OrderResponse updateStatusByUser(Integer userId, String orderCode, String status) {
        Order order = orderRepo.findByOrderCodeAndUserId(orderCode, userId)
                .orElseThrow(() -> new RuntimeException("Order not found or not owned by user"));

        String s = status.trim().toUpperCase();
        Set<String> allowed = Set.of("COMPLETED", "RETURN");
        if (!allowed.contains(s)) {
            throw new RuntimeException("Invalid status: " + s);
        }

        order.setStatus(s);
        orderRepo.save(order);
        sendMail(order.getEmail(), order.getFullName(), orderCode, "Order status updated: <b>" + s + "</b>");
        return toResponse(order, orderItemRepo.findByOrderId(order.getId()));
    }

    @Override
    @Transactional
    public void cancelPendingOrder(String orderCode) {
        Order order = orderRepo.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Only PENDING orders can be cancelled");
        }

        order.setStatus("CANCELLED");
        orderRepo.save(order);

        List<OrderItem> items = orderItemRepo.findByOrderId(order.getId());
        for (OrderItem item : items) {
            variantRepo.findById(item.getVariant().getId()).ifPresent(variant -> {
                variant.setStock(variant.getStock() + item.getQuantity());
                variantRepo.save(variant);
            });
        }
        log.info("Đơn hàng {} đã bị hủy", orderCode);
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(String orderCode, String status) {
        Order order = orderRepo.findByOrderCode(orderCode).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        if ("DELIVERED".equalsIgnoreCase(status)) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        orderRepo.save(order);
        sendMail(order.getEmail(), order.getFullName(), orderCode, "Order status updated: <b>" + status + "</b>");
        return toResponse(order, orderItemRepo.findByOrderId(order.getId()));
    }

    @Override
    public Page<OrderResponse> getAllOrders(String code, String status, Pageable pageable) {
        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Predicate notPending = cb.notEqual(root.get("status"), "PENDING");
            Predicate isCod = cb.equal(root.get("paymentMethod"), "COD");
            predicates.add(cb.or(notPending, isCod));

            if (code != null && !code.isBlank()) {
                predicates.add(cb.like(root.get("orderCode"), "%" + code + "%"));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Order> page = orderRepo.findAll(spec, pageable);
        List<OrderResponse> result = page.getContent().stream()
                .map(o -> toResponse(o, orderItemRepo.findByOrderId(o.getId())))
                .toList();

        return new PageImpl<>(result, pageable, page.getTotalElements());
    }

    @Override
    public boolean hasNewOrdersAfter(long sinceMillis) {
        if (sinceMillis <= 0) return false;
        LocalDateTime since = LocalDateTime.ofInstant(Instant.ofEpochMilli(sinceMillis), ZoneId.systemDefault());
        return orderRepo.existsByCreatedAtAfter(since);
    }





    // ================== HELPER METHODS ==================

    private double getProductPrice(Integer productId) {
        Product p = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        return Optional.ofNullable(p.getPrice()).orElse(0.0);
    }

    private OrderResponse toResponse(Order o, List<OrderItem> items) {
        // SỬA Ở ĐÂY: Get qua liên kết Object
        List<OrderItemResponse> itemDtos = items.stream().map(oi -> OrderItemResponse.builder()
                .id(String.valueOf(oi.getId()))
                .productId(String.valueOf(oi.getProduct().getId()))
                .variantId(String.valueOf(oi.getVariant().getId()))
                .productName(oi.getProduct().getName())
                .color(oi.getVariant() != null ? oi.getVariant().getColor() : null)
                .size(oi.getVariant() != null ? oi.getVariant().getSize() : null)
                .imageUrl(resolveOrderItemImage(oi))
                .thumbnailUrl(resolveOrderItemImage(oi))
                .quantity(oi.getQuantity())
                .price(oi.getPrice())
                .build()).toList();

        Payment payment = paymentRepo.findByOrderId(o.getId()).orElse(null);
        String paymentStatus = "COD".equals(o.getPaymentMethod()) ? "COD" : (payment != null ? payment.getPaymentStatus() : "PENDING");

        return OrderResponse.builder()
                .id(String.valueOf(o.getId()))
                .orderCode(o.getOrderCode())
                .userId(o.getUser() != null ? String.valueOf(o.getUser().getId()) : null)
                .fullName(o.getFullName())
                .email(o.getEmail())
                .phone(o.getPhone())
                .address(o.getAddress())
                .couponId(o.getCoupon() != null ? String.valueOf(o.getCoupon().getId()) : null)
                .couponCode(o.getCoupon() != null ? o.getCoupon().getCode() : null)
                .discountPercent(o.getDiscountPercent())
                .discountValue(o.getDiscountValue())
                .subtotal(o.getSubtotal())
                .finalTotal(o.getFinalTotal())
                .status(o.getStatus())
                .deliveredAt(o.getDeliveredAt())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .items(itemDtos)
                .paymentMethod(o.getPaymentMethod())
                .paymentLink(payment != null ? payment.getPaymentLink() : null)
                .qrCodeUrl(payment != null ? payment.getQrCodeUrl() : null)
                .paymentStatus(paymentStatus)
                .paidAt(payment != null ? payment.getPaidAt() : null)
                .build();
    }

    private String customerName(Order order) {
        return Optional.ofNullable(order.getFullName())
                .filter(s -> !s.isBlank())
                .orElse(order.getEmail().split("@")[0]);
    }

    private void rollbackStock(List<OrderItem> orderItems) {
        for (OrderItem oi : orderItems) {
            // SỬA Ở ĐÂY: Lấy ID từ Object Variant
            variantRepo.findById(oi.getVariant().getId()).ifPresent(variant -> {
                variant.setStock(variant.getStock() + oi.getQuantity());
                variantRepo.save(variant);
            });
        }
    }

    private String generateUniqueDisplayCode() {
        String code;
        do { code = codeGenerator.generate(); } while (orderRepo.existsByOrderCode(code));
        return code;
    }

    private void sendMail(String email, String fullName, String orderCode, String messageBody) {
        String name = (fullName != null && !fullName.isBlank()) ? fullName : email.split("@")[0];
        String html = EmailTemplateBuilder.build(name, "Order Update - " + orderCode, messageBody, "View Order", "http://localhost:3000/user/profile");
        sendMail.sendMail(email, "Trendify - Order Update " + orderCode, html);
    }

    private void sendPendingPaymentEmail(Order order, String checkoutUrl, String qrCodeUrl) {
        String name = customerName(order);
        long amountVND = Math.round(order.getFinalTotal());

        String htmlContent = EmailTemplateBuilder.build(name, "Vui lòng thanh toán đơn hàng " + order.getOrderCode(),
                """
                <h2>Xin chào <b>%s</b>!</h2>
                <p>Cảm ơn bạn đã đặt hàng tại <b>Trendify</b></p>
                <ul>
                    <li><strong>Mã đơn hàng:</strong> <b style="color:#e74c3c;">%s</b></li>
                    <li><strong>Tổng tiền:</strong> <span style="font-size:1.5em; color:#27ae60; font-weight:bold;">%,d VNĐ</span></li>
                </ul>
                <div style="background:#f8f9fa; padding:20px; text-align:center; margin:20px 0;">
                    <a href="%s" style="background:#3498db; color:white; padding:12px 30px; text-decoration:none; border-radius:6px;">Nhấn để thanh toán ngay</a>
                    <p>Hoặc quét mã QR bên dưới</p>
                    <img src="%s" alt="QR" style="max-width:250px;" />
                </div>
                """.formatted(name, order.getOrderCode(), amountVND, checkoutUrl, qrCodeUrl),
                "Xem chi tiết đơn", "http://localhost:3000/user/profile"
        );
        sendMail.sendMail(order.getEmail(), "Trendify - Thanh toán " + order.getOrderCode(), htmlContent);
    }

    private String resolveOrderItemImage(OrderItem item) {
        Integer productId = item.getProduct() != null ? item.getProduct().getId() : null;
        if (productId == null) return null;

        String color = item.getVariant() != null ? item.getVariant().getColor() : null;
        if (color != null && !color.isBlank()) {
            Optional<String> colorImage = productImageRepo
                    .findByProductIdAndColorIgnoreCaseAndDeletedAtIsNull(productId, color)
                    .stream()
                    .filter(img -> img.getUrl() != null && !img.getUrl().isBlank())
                    .map(ProductImage::getUrl)
                    .findFirst();
            if (colorImage.isPresent()) return colorImage.get();
        }

        Optional<String> thumbnail = productImageRepo
                .findFirstByProductIdAndIsThumbnailTrueAndDeletedAtIsNull(productId)
                .map(ProductImage::getUrl)
                .filter(url -> !url.isBlank());
        if (thumbnail.isPresent()) return thumbnail.get();

        return productImageRepo.findByProductIdAndDeletedAtIsNull(productId)
                .stream()
                .filter(img -> img.getUrl() != null && !img.getUrl().isBlank())
                .map(ProductImage::getUrl)
                .findFirst()
                .orElse(null);
    }
}

