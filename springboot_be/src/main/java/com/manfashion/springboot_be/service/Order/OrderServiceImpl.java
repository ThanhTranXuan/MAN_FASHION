package com.manfashion.springboot_be.service.Order;

import com.manfashion.springboot_be.DTO.Cart.CartItemRequest;
import com.manfashion.springboot_be.DTO.Order.OrderRequest;
import com.manfashion.springboot_be.DTO.Order.OrderResponse;
import com.manfashion.springboot_be.entity.*;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.OrderItemMapper;
import com.manfashion.springboot_be.mapper.OrderMapper;
import com.manfashion.springboot_be.repository.Coupon.CouponRepository;
import com.manfashion.springboot_be.repository.Order.OrderItemRepository;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Payment.PaymentRepository;
import com.manfashion.springboot_be.repository.Product.ProductImageRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Product.ProductReviewRepository;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {
    private static final Set<String> FINAL_ORDER_STATUSES =
            Set.of("COMPLETED", "CANCELLED", "RETURN", "RETURNED", "REFUNDED");

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
    private final SimpMessagingTemplate messaging;
    private final ProductReviewRepository productReviewRepository;
    private final OrderCancellationService cancellationService;


    @Override
    @Transactional
    public OrderResponse createFromCart(Integer userId, OrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new AppException(ErrorCode.ORDER_ITEMS_EMPTY);
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


            if (!variant.getProduct().getId().equals(productId)) {
                throw new RuntimeException("Variant does not belong to the specified product");
            }

            int quantity = ci.getQuantity();
            if (quantity <= 0) {
                throw new RuntimeException("Invalid quantity");
            }

            int updatedRows = variantRepo.decrementStockIfAvailable(variantId, quantity);
            if (updatedRows == 0) {
                throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
            }

            Product product = productRepo.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
            if (product.getDeletedAt() != null || Boolean.FALSE.equals(product.getIsActive())) {
                throw new AppException(ErrorCode.PRODUCT_IS_ACTIVE);
            }
            double priceVND = Optional.ofNullable(product.getPrice()).orElse(0.0);
            subtotal += quantity * priceVND;
            String imageUrl = resolveOrderItemImage(OrderItem.builder()
                    .product(product)
                    .variant(variant)
                    .build());


            orderItems.add(OrderItem.builder()
                    .product(product)
                    .variant(variant)
                    .quantity(quantity)
                    .price(priceVND)
                    .productName(product.getName())
                    .variantColor(variant.getColor())
                    .variantSize(variant.getSize())
                    .imageUrl(imageUrl)
                    .build());

            itemsForPayOS.add(PaymentLinkItem.builder()
                    .name("Sản phẩm Trendify")
                    .quantity(quantity)
                    .price((long) Math.round(priceVND))
                    .build());
        }

        double discountPercent = 0.0;
        double discountValue = 0.0;
        Coupon appliedCoupon = null;

        if (req.getCouponId() != null && !req.getCouponId().isBlank()) {
            Integer couponId = Integer.valueOf(req.getCouponId());
            appliedCoupon = couponRepo.findById(couponId)
                    .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_INVALID));

            LocalDateTime now = LocalDateTime.now();
            if (appliedCoupon.getDeletedAt() != null
                    || (appliedCoupon.getStartDate() != null && now.isBefore(appliedCoupon.getStartDate()))
                    || (appliedCoupon.getEndDate() != null && now.isAfter(appliedCoupon.getEndDate()))) {
                throw new AppException(ErrorCode.VOUCHER_INVALID);
            }

            discountPercent = Optional.ofNullable(appliedCoupon.getDiscountValue()).orElse(0.0);
            discountValue = subtotal * discountPercent / 100.0;

            int updatedCoupon = couponRepo.incrementUsedCountIfAvailable(couponId);
            if (updatedCoupon == 0) {
                throw new AppException(ErrorCode.VOUCHER_USAGE_LIMIT_EXCEEDED);
            }
        }

        double finalTotal = subtotal - discountValue;
        long amountVND = Math.round(finalTotal);

        String paymentMethod = req.getPaymentMethod();
        if (!"VIETQR".equals(paymentMethod) && !"COD".equals(paymentMethod)) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ");
        }

        String orderCode = generateUniqueDisplayCode();


        Order order = Order.builder()
                .orderCode(orderCode)
                .user(userId == null ? null : User.builder().id(userId).build())
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

            oi.setOrder(order);
            orderItemRepo.save(oi);
        }

        publishAdminNotification(Map.of(
                "type", "NEW_ORDER",
                "orderId", order.getId(),
                "orderCode", order.getOrderCode(),
                "createdAt", LocalDateTime.now().toString()
        ));
        messaging.convertAndSend("/topic/new-order", (Object) Map.of(
                "orderId", order.getId(),
                "orderCode", order.getOrderCode(),
                "timestamp", System.currentTimeMillis()
        ));

        if ("COD".equals(paymentMethod)) {
            paymentService.createCodPayment(order.getId(), (double) amountVND);
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
        return mapOrderPage(page, pageable);
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
        if ("COMPLETED".equals(s) && "COD".equals(order.getPaymentMethod())) {
            paymentService.markCodAsPaid(order.getId());
        }
        sendMail(order.getEmail(), order.getFullName(), orderCode, "Order status updated: <b>" + s + "</b>");
        publishOrderStatus(order);
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

        cancellationService.cancelAndRestoreStock(
                order.getId(), "CANCELLED", "Order cancelled"
        );
        log.info("Đơn hàng {} đã bị hủy", orderCode);
    }

    @Override
    @Transactional
    public void cancelPendingOrderByUser(Integer userId, String orderCode) {
        Order order = orderRepo.findByOrderCodeAndUserId(orderCode, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_USER_NOT_BELONG));
        if (!"PENDING".equals(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
        }
        cancellationService.cancelAndRestoreStock(
                order.getId(), "CANCELLED", "Order cancelled by customer"
        );
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(String orderCode, String status) {
        Order order = orderRepo.findByOrderCode(orderCode).orElseThrow(() -> new RuntimeException("Order not found"));
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        if (FINAL_ORDER_STATUSES.contains(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_STATUS_FINAL);
        }
        if ("CANCELLED".equals(normalizedStatus)) {
            cancellationService.cancelAndRestoreStock(
                    order.getId(), "CANCELLED", "Order cancelled by admin"
            );
            Order cancelled = orderRepo.findById(order.getId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            publishOrderStatus(cancelled);
            return toResponse(cancelled, orderItemRepo.findByOrderId(cancelled.getId()));
        }
        order.setStatus(normalizedStatus);
        if ("DELIVERED".equals(normalizedStatus)) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        orderRepo.save(order);
        if ("COD".equals(order.getPaymentMethod())
                && ("DELIVERED".equals(normalizedStatus) || "COMPLETED".equals(normalizedStatus))) {
            paymentService.markCodAsPaid(order.getId());
        }
        sendMail(order.getEmail(), order.getFullName(), orderCode, "Order status updated: <b>" + normalizedStatus + "</b>");
        publishOrderStatus(order);
        return toResponse(order, orderItemRepo.findByOrderId(order.getId()));
    }

    @Override
    public Page<OrderResponse> getAllOrders(String code, String status, Pageable pageable) {
        Pageable effectivePageable = pageable.getSort().isSorted()
                ? pageable
                : PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (code != null && !code.isBlank()) {
                String pattern = "%" + code.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("orderCode")), pattern),
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("phone")), pattern)
                ));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Order> page = orderRepo.findAll(spec, effectivePageable);
        return mapOrderPage(page, effectivePageable);
    }

    @Override
    public boolean hasNewOrdersAfter(long sinceMillis) {
        if (sinceMillis <= 0) return false;
        LocalDateTime since = LocalDateTime.ofInstant(Instant.ofEpochMilli(sinceMillis), ZoneId.systemDefault());
        return orderRepo.existsByCreatedAtAfter(since);
    }







    private void publishOrderStatus(Order order) {
        Map<String, Object> event = new java.util.HashMap<>();
        event.put("type", "ORDER_STATUS_UPDATED");
        event.put("orderId", order.getId());
        event.put("orderCode", order.getOrderCode());
        event.put("status", order.getStatus());
        event.put("message", "Đơn hàng " + order.getOrderCode() + " đã được cập nhật trạng thái");
        event.put("timestamp", System.currentTimeMillis());
        Integer userId = order.getUser() == null ? null : order.getUser().getId();
        if (userId != null) {
            event.put("userId", userId);
        }

        messaging.convertAndSend("/topic/order-status", (Object) event);
        if (userId != null) {
            messaging.convertAndSend(
                    "/topic/users/" + userId + "/notifications",
                    (Object) event
            );
        }
        publishAdminNotification(event);
    }

    private void publishAdminNotification(Map<String, Object> event) {
        messaging.convertAndSend("/topic/admin/notifications", (Object) event);
    }

    private OrderResponse toResponse(Order o, List<OrderItem> items) {
        return toResponse(o, items, null, null);
    }

    private Page<OrderResponse> mapOrderPage(Page<Order> page, Pageable pageable) {
        List<Order> orders = page.getContent();
        if (orders.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, page.getTotalElements());
        }

        List<Integer> orderIds = orders.stream().map(Order::getId).toList();
        List<OrderItem> allItems = orderItemRepo.findByOrderIdIn(orderIds);

        Map<Integer, List<OrderItem>> itemsByOrderId = allItems.stream()
                .collect(Collectors.groupingBy(item -> item.getOrder().getId()));

        Map<Integer, Payment> paymentByOrderId = paymentRepo.findByOrderIdIn(orderIds).stream()
                .collect(Collectors.toMap(Payment::getOrderId, payment -> payment, (first, ignored) -> first));

        List<Integer> productIds = allItems.stream()
                .map(item -> item.getProduct() != null ? item.getProduct().getId() : null)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Integer, List<ProductImage>> imagesByProductId = productIds.isEmpty()
                ? Collections.emptyMap()
                : productImageRepo.findByProductIdInAndDeletedAtIsNull(productIds).stream()
                .collect(Collectors.groupingBy(image -> image.getProduct().getId()));

        List<OrderResponse> result = orders.stream()
                .map(order -> toResponse(
                        order,
                        itemsByOrderId.getOrDefault(order.getId(), Collections.emptyList()),
                        paymentByOrderId.get(order.getId()),
                        imagesByProductId
                ))
                .toList();

        return new PageImpl<>(result, pageable, page.getTotalElements());
    }

    private OrderResponse toResponse(Order o, List<OrderItem> items, Payment preloadedPayment, Map<Integer, List<ProductImage>> imagesByProductId) {

        var itemResponses = items.stream()
                .map(item -> orderItemMapper.toResponse(
                        item,
                        resolveOrderItemImage(item, imagesByProductId)
                ))
                .toList();

        Integer userId = o.getUser() != null ? o.getUser().getId() : null;
        List<Integer> reviewedProductIds = items.stream()
                .map(item -> item.getProduct() != null ? item.getProduct().getId() : null)
                .filter(id -> id != null)
                .distinct()
                .toList();
        Map<Integer, Long> reviewIdByProductId = (userId == null || reviewedProductIds.isEmpty())
                ? Collections.emptyMap()
                : productReviewRepository
                .findByUser_IdAndProduct_IdInAndDeletedAtIsNull(userId, reviewedProductIds)
                .stream()
                .collect(Collectors.toMap(
                        review -> review.getProduct().getId(),
                        ProductReview::getId,
                        (first, ignored) -> first
                ));

        itemResponses.forEach(item -> {
            Integer productId = parseInteger(item.getProductId());
            Long reviewId = productId == null ? null : reviewIdByProductId.get(productId);
            item.setReviewed(reviewId != null);
            item.setReviewId(reviewId);
        });

        Payment payment = preloadedPayment != null ? preloadedPayment : paymentRepo.findByOrderId(o.getId()).orElse(null);
        return orderMapper.toResponse(o, itemResponses, payment);
    }

    private Integer parseInteger(String value) {
        try {
            return value == null ? null : Integer.valueOf(value);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private String customerName(Order order) {
        return Optional.ofNullable(order.getFullName())
                .filter(s -> !s.isBlank())
                .orElse(order.getEmail().split("@")[0]);
    }

    private void rollbackStock(List<OrderItem> orderItems) {
        for (OrderItem oi : orderItems) {

            variantRepo.findById(oi.getVariant().getId()).ifPresent(variant -> {
                variantRepo.incrementStock(variant.getId(), oi.getQuantity());
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
        return resolveOrderItemImage(item, null);
    }

    private String resolveOrderItemImage(OrderItem item, Map<Integer, List<ProductImage>> imagesByProductId) {
        Integer productId = item.getProduct() != null ? item.getProduct().getId() : null;
        if (productId == null) return null;

        String color = item.getVariant() != null ? item.getVariant().getColor() : null;
        if (imagesByProductId != null) {
            List<ProductImage> images = imagesByProductId.getOrDefault(productId, Collections.emptyList());
            if (color != null && !color.isBlank()) {
                Optional<String> colorImage = images.stream()
                        .filter(img -> img.getColor() != null && img.getColor().equalsIgnoreCase(color))
                        .filter(img -> img.getUrl() != null && !img.getUrl().isBlank())
                        .map(ProductImage::getUrl)
                        .findFirst();
                if (colorImage.isPresent()) return colorImage.get();
            }

            Optional<String> thumbnail = images.stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                    .map(ProductImage::getUrl)
                    .filter(url -> url != null && !url.isBlank())
                    .findFirst();
            if (thumbnail.isPresent()) return thumbnail.get();

            return images.stream()
                    .map(ProductImage::getUrl)
                    .filter(url -> url != null && !url.isBlank())
                    .findFirst()
                    .orElse(null);
        }

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

