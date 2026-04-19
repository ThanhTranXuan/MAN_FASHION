package com.manfashion.springboot_be.service.Return;

import com.manfashion.springboot_be.DTO.Return.ReturnItemRequest;
import com.manfashion.springboot_be.DTO.Return.ReturnItemResponse;
import com.manfashion.springboot_be.DTO.Return.ReturnOrderRequest;
import com.manfashion.springboot_be.DTO.Return.ReturnOrderResponse;
import com.manfashion.springboot_be.entity.*;
import com.manfashion.springboot_be.repository.Order.OrderItemRepository;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Product.ProductVariantRepository;
import com.manfashion.springboot_be.repository.Return.ReturnItemRepository;
import com.manfashion.springboot_be.repository.Return.ReturnOrderRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import com.manfashion.springboot_be.util.CodeGenerator;
import com.manfashion.springboot_be.util.EmailTemplateBuilder;
import com.manfashion.springboot_be.util.SendMail;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReturnOrderServiceImpl implements ReturnOrderService {

    // Các Repository này phải extends JpaRepository<Entity, Integer>
    // Riêng ReturnOrderRepository cần extends thêm JpaSpecificationExecutor<ReturnOrder>
    private final ReturnOrderRepository returnRepo;
    private final ReturnItemRepository returnItemRepo;
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final ProductVariantRepository productVariantRepo;
    private final UserRepository userRepository;
    private final SendMail sendMail;
    private final CodeGenerator codeGenerator;
    private final SimpMessagingTemplate messaging;

    // =====================================================
    // 🟢 USER REQUEST RETURN
    // =====================================================
    @Override
    @Transactional // Đảm bảo nếu lỗi ở bất kỳ bước nào, toàn bộ dữ liệu sẽ được rollback
    public ReturnOrderResponse requestReturn(String userId, ReturnOrderRequest req) {
        Integer uId = Integer.valueOf(userId); // Ép kiểu từ token String sang Integer của DB
        // [THÊM MỚI]: Tìm Object User từ database
        User user = userRepository.findById(uId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // 1. Kiểm tra đơn hàng có tồn tại và thuộc về user này không
        Order order = orderRepo.findByOrderCodeAndUserId(req.getOrderCode(), uId)
                .orElseThrow(() -> new RuntimeException("Order not found or not owned by user"));

        List<OrderItem> orderItems = orderItemRepo.findByOrderId(order.getId());
        List<ReturnItem> createdItems = new ArrayList<>();

        // 2. Tạo mã trả hàng mới
        String returnCode = codeGenerator.generate().replace("ORD-", "RET-");

        // 3. Tạo record ReturnOrder
        ReturnOrder ro = ReturnOrder.builder()
                .returnCode(returnCode)
                .order(order)
                .user(user)
                .reason(req.getReason())
                .note(req.getNote())
                .status("REQUESTED")
                .refundAmount(0.0) // Sẽ tính lại sau
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Lưu trước để lấy ID tự tăng từ DB cho các ReturnItem
//        ro = returnRepo.save(ro);

        final ReturnOrder savedRo = returnRepo.save(ro);
        // 4. Xử lý danh sách sản phẩm trả về
        if (req.getItems() == null || req.getItems().isEmpty()) {
            // Nếu không truyền list items -> User muốn trả lại toàn bộ đơn hàng
            for (OrderItem oi : orderItems) {
                createdItems.add(returnItemRepo.save(
                        ReturnItem.builder()
                                .returnOrder(savedRo)
                                .orderItem(oi)
                                .quantity(oi.getQuantity())
                                .unitPrice(oi.getPrice())
                                .status("PENDING")
                                .createdAt(LocalDateTime.now())
                                .build()
                ));
            }
        } else {
            // Nếu có truyền list items -> Chỉ trả lại một phần
            for (ReturnItemRequest r : req.getItems()) {
                Integer requestedOrderItemId = Integer.valueOf(r.getOrderItemId());

                orderItems.stream()
                        .filter(oi -> oi.getId().equals(requestedOrderItemId))
                        .findFirst()
                        .ifPresent(oi -> createdItems.add(returnItemRepo.save(
                                ReturnItem.builder()
                                        .returnOrder(savedRo)
                                        .orderItem(oi)
                                        // Đảm bảo số lượng trả không vượt quá số lượng đã mua
                                        .quantity(Math.min(r.getQuantity(), oi.getQuantity()))
                                        .unitPrice(Optional.ofNullable(r.getUnitPrice()).orElse(oi.getPrice()))
                                        .status("PENDING")
                                        .createdAt(LocalDateTime.now())
                                        .build()
                        )));
            }
        }

        // 5. Tính toán tổng tiền hoàn trả
        double refund = createdItems.stream()
                .mapToDouble(i -> i.getQuantity() * i.getUnitPrice())
                .sum();

        ro.setRefundAmount(refund);
        returnRepo.save(ro); // Cập nhật lại số tiền vào DB

        // 6. Cập nhật trạng thái đơn hàng gốc
        order.setStatus("RETURN");
        orderRepo.save(order);

        // 7. Gửi Email thông báo cho khách hàng
        sendMailWithTemplate(
                order.getEmail(),
                order.getFullName(),
                "Trendify Return Requested - " + order.getOrderCode(),
                "🔁 Return requested for order <b>" + order.getOrderCode()
                        + "</b><br>Refund estimate: <b>$" + refund + "</b>",
                "View Return Request",
                "http://localhost:3000/user/profile"
        );

        // 8. Bắn WebSocket thông báo cho Admin có đơn trả hàng mới (đã sửa)
        messaging.convertAndSend("/topic/new-return", (Object) Map.of(
                "code", ro.getReturnCode(),
                "timestamp", System.currentTimeMillis()
        ));

        return toResponse(ro, createdItems);
    }

    // =====================================================
    // 🟣 ADMIN UPDATE STATUS
    // =====================================================
    @Override
    @Transactional
    public ReturnOrderResponse updateStatus(String returnCode, String status) {
        ReturnOrder ro = returnRepo.findByReturnCode(returnCode)
                .orElseThrow(() -> new RuntimeException("Return not found"));

        String s = status.toUpperCase(Locale.ROOT);
        Set<String> allowed = Set.of("APPROVED", "REJECTED", "RECEIVED", "COMPLETED");

        if (!allowed.contains(s)) {
            throw new RuntimeException("Invalid status: " + s);
        }

        ro.setStatus(s);
        ro.setUpdatedAt(LocalDateTime.now());
        returnRepo.save(ro);

        // Nếu trạng thái là COMPLETED => Hoàn trả lại số lượng tồn kho (Stock)
        if (s.equals("COMPLETED")) {
            List<ReturnItem> items = returnItemRepo.findByReturnOrderId(ro.getId());
            for (ReturnItem i : items) {
                orderItemRepo.findById(i.getOrderItem().getId()).ifPresent(oi ->
                        productVariantRepo.findById(oi.getVariant().getId()).ifPresent(variant -> {
                            variant.setStock(variant.getStock() + i.getQuantity());
                            productVariantRepo.save(variant);
                        })
                );
            }
        }

        // Tìm đơn hàng gốc để lấy email khách hàng
        Order order = orderRepo.findById(ro.getOrder().getId())
                .orElseThrow(() -> new RuntimeException("Original order not found"));

        sendMailWithTemplate(
                order.getEmail(),
                order.getFullName(),
                "Return Order Update - " + ro.getReturnCode(),
                """
                        🔔 Your return request has been <b style='color:#3182CE;'>%s</b>.
                        <br><br>
                        Thank you for your patience — our team will follow up shortly.
                        """.formatted(s),
                "View Return Details",
                "http://localhost:3000/user/profile"
        );

        List<ReturnItem> items = returnItemRepo.findByReturnOrderId(ro.getId());
        return toResponse(ro, items);
    }

    // =====================================================
    // 📃 ADMIN GET ALL (Hỗ trợ filter động với Specification)
    // =====================================================
    @Override
    public Page<ReturnOrderResponse> getAll(String code, String status, Pageable pageable) {
        Specification<ReturnOrder> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (code != null && !code.isBlank()) {
                // Lọc LIKE %code% (Không phân biệt hoa thường)
                predicates.add(cb.like(cb.lower(root.get("returnCode")), "%" + code.toLowerCase() + "%"));
            }

            if (status != null && !status.isBlank()) {
                // Lọc chính xác trạng thái
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ReturnOrder> page = returnRepo.findAll(spec, pageable);

        return page.map(ro -> {
            List<ReturnItem> items = returnItemRepo.findByReturnOrderId(ro.getId());
            return toResponse(ro, items);
        });
    }

    // =====================================================
    // 👤 USER: GET BY USER ID
    // =====================================================
    @Override
    public Page<ReturnOrderResponse> getByUserId(String userId, Pageable pageable) {
        Integer uId = Integer.valueOf(userId);
        Page<ReturnOrder> page = returnRepo.findByUserIdOrderByCreatedAtDesc(uId, pageable);

        return page.map(ro -> {
            List<ReturnItem> items = returnItemRepo.findByReturnOrderId(ro.getId());
            return toResponse(ro, items);
        });
    }

    // =====================================================
    // 🔍 CHECK NEW RETURNS (Dùng cho Polling)
    // =====================================================
    @Override
    public boolean hasNewReturnsAfter(long sinceMillis) {
        if (sinceMillis <= 0) return false;

        LocalDateTime since = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(sinceMillis),
                ZoneId.systemDefault()
        );

        return returnRepo.existsByCreatedAtAfter(since);
    }

    // =====================================================
    // 🧱 HELPER MAPPING & EMAIL (PRIVATE METHODS)
    // =====================================================
    private ReturnItemResponse toItemResponse(ReturnItem item) {
        return ReturnItemResponse.builder()
                .id(String.valueOf(item.getId()))
                .orderItemId(String.valueOf(item.getOrderItem().getId()))
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .build();
    }

    private ReturnOrderResponse toResponse(ReturnOrder ro, List<ReturnItem> items) {
        List<ReturnItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        String orderCode = orderRepo.findById(ro.getOrder().getId())
                .map(Order::getOrderCode)
                .orElse(null);

        return ReturnOrderResponse.builder()
                .id(String.valueOf(ro.getId()))
                .returnCode(ro.getReturnCode())
                .orderId(String.valueOf(ro.getOrder().getId()))
                .orderCode(orderCode)
                .userId(String.valueOf(ro.getUser().getId()))
                .reason(ro.getReason())
                .note(ro.getNote())
                .status(ro.getStatus())
                .refundAmount(ro.getRefundAmount())
                .items(itemResponses)
                .createdAt(ro.getCreatedAt())
                .updatedAt(ro.getUpdatedAt())
                .build();
    }

    private void sendMailWithTemplate(
            String email,
            String name,
            String title,
            String content,
            String buttonText,
            String buttonLink
    ) {
        String displayName = (name != null && !name.isBlank())
                ? name
                : email.split("@")[0];

        String html = EmailTemplateBuilder.build(
                displayName,
                title,
                content,
                buttonText,
                buttonLink
        );

        boolean sent = sendMail.sendMail(email, title, html);

        if (!sent) {
            log.error("⚠️ Email not sent to: {}", email);
        }
    }
}
