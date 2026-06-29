package com.manfashion.springboot_be.service.Return;

import com.manfashion.springboot_be.DTO.Return.ReturnItemRequest;
import com.manfashion.springboot_be.DTO.Return.ReturnOrderRequest;
import com.manfashion.springboot_be.DTO.Return.ReturnOrderResponse;
import com.manfashion.springboot_be.entity.*;
import com.manfashion.springboot_be.mapper.ReturnOrderMapper;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReturnOrderServiceImpl implements ReturnOrderService {



    private final ReturnOrderRepository returnRepo;
    private final ReturnItemRepository returnItemRepo;
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final ProductVariantRepository productVariantRepo;
    private final UserRepository userRepository;
    private final SendMail sendMail;
    private final CodeGenerator codeGenerator;
    private final SimpMessagingTemplate messaging;
    private final ReturnOrderMapper returnOrderMapper;




    @Override
    @Transactional
    public ReturnOrderResponse requestReturn(String userId, ReturnOrderRequest req) {
        Integer uId = Integer.valueOf(userId);

        User user = userRepository.findById(uId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepo.findByOrderCodeAndUserId(req.getOrderCode(), uId)
                .orElseThrow(() -> new RuntimeException("Order not found or not owned by user"));

        List<OrderItem> orderItems = orderItemRepo.findByOrderId(order.getId());
        List<ReturnItem> createdItems = new ArrayList<>();


        String returnCode = codeGenerator.generate().replace("ORD-", "RET-");


        ReturnOrder ro = ReturnOrder.builder()
                .returnCode(returnCode)
                .order(order)
                .user(user)
                .reason(req.getReason())
                .note(req.getNote())
                .status("REQUESTED")
                .refundAmount(0.0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();




        final ReturnOrder savedRo = returnRepo.save(ro);

        if (req.getItems() == null || req.getItems().isEmpty()) {

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

            for (ReturnItemRequest r : req.getItems()) {
                Integer requestedOrderItemId = Integer.valueOf(r.getOrderItemId());

                orderItems.stream()
                        .filter(oi -> oi.getId().equals(requestedOrderItemId))
                        .findFirst()
                        .ifPresent(oi -> createdItems.add(returnItemRepo.save(
                                ReturnItem.builder()
                                        .returnOrder(savedRo)
                                        .orderItem(oi)

                                        .quantity(Math.min(r.getQuantity(), oi.getQuantity()))
                                        .unitPrice(Optional.ofNullable(r.getUnitPrice()).orElse(oi.getPrice()))
                                        .status("PENDING")
                                        .createdAt(LocalDateTime.now())
                                        .build()
                        )));
            }
        }


        double refund = createdItems.stream()
                .mapToDouble(i -> i.getQuantity() * i.getUnitPrice())
                .sum();

        ro.setRefundAmount(refund);
        returnRepo.save(ro);


        order.setStatus("RETURN");
        orderRepo.save(order);
        Map<String, Object> orderStatusEvent = Map.of(
                "type", "ORDER_STATUS_UPDATED",
                "orderId", order.getId(),
                "orderCode", order.getOrderCode(),
                "status", order.getStatus(),
                "userId", order.getUser().getId(),
                "message", "Đơn hàng " + order.getOrderCode() + " đã được cập nhật trạng thái",
                "timestamp", System.currentTimeMillis()
        );
        messaging.convertAndSend("/topic/order-status", (Object) orderStatusEvent);
        messaging.convertAndSend(
                "/topic/users/" + order.getUser().getId() + "/notifications",
                (Object) orderStatusEvent
        );


        sendMailWithTemplate(
                order.getEmail(),
                order.getFullName(),
                "Trendify Return Requested - " + order.getOrderCode(),
                "🔁 Return requested for order <b>" + order.getOrderCode()
                        + "</b><br>Refund estimate: <b>$" + refund + "</b>",
                "View Return Request",
                "http://localhost:3000/user/profile"
        );


        messaging.convertAndSend("/topic/new-return", (Object) Map.of(
                "code", ro.getReturnCode(),
                "timestamp", System.currentTimeMillis()
        ));
        messaging.convertAndSend("/topic/admin/notifications", (Object) Map.of(
                "type", "NEW_RETURN",
                "returnId", ro.getId(),
                "returnCode", ro.getReturnCode(),
                "orderCode", order.getOrderCode(),
                "createdAt", LocalDateTime.now().toString()
        ));

        return returnOrderMapper.toResponse(ro, createdItems);
    }




    @Override
    @Transactional
    public ReturnOrderResponse updateStatus(
            String returnCode,
            String status,
            String rejectReason,
            String processedById
    ) {
        ReturnOrder ro = returnRepo.findByReturnCode(returnCode)
                .orElseThrow(() -> new RuntimeException("Return not found"));

        String s = status.toUpperCase(Locale.ROOT);
        Set<String> allowed = Set.of("APPROVED", "REJECTED", "RECEIVED", "COMPLETED");

        if (!allowed.contains(s)) {
            throw new RuntimeException("Invalid status: " + s);
        }
        if ("REJECTED".equals(s) && (rejectReason == null || rejectReason.isBlank())) {
            throw new AppException(ErrorCode.RETURN_REJECT_REASON_REQUIRED);
        }

        String previousStatus = ro.getStatus();
        ro.setStatus(s);
        ro.setProcessedBy(userRepository.findById(Integer.valueOf(processedById))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
        ro.setProcessedAt(LocalDateTime.now());
        ro.setRejectReason("REJECTED".equals(s) ? rejectReason.trim() : null);
        ro.setUpdatedAt(LocalDateTime.now());
        returnRepo.save(ro);


        if (s.equals("COMPLETED") && !"COMPLETED".equals(previousStatus)) {
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

        messaging.convertAndSend("/topic/return-status", (Object) Map.of(
                "returnCode", ro.getReturnCode(),
                "status", ro.getStatus(),
                "userId", order.getUser().getId(),
                "timestamp", System.currentTimeMillis()
        ));

        List<ReturnItem> items = returnItemRepo.findByReturnOrderId(ro.getId());
        return returnOrderMapper.toResponse(ro, items);
    }




    @Override
    public Page<ReturnOrderResponse> getAll(String code, String status, Pageable pageable) {
        Specification<ReturnOrder> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (code != null && !code.isBlank()) {
                String keyword = "%" + code.toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("returnCode")), keyword),
                        cb.like(cb.lower(root.get("order").get("orderCode")), keyword),
                        cb.like(cb.lower(root.get("user").get("fullName")), keyword),
                        cb.like(cb.lower(root.get("user").get("email")), keyword),
                        cb.like(cb.lower(root.get("user").get("phone")), keyword)
                ));
            }

            if (status != null && !status.isBlank()) {

                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ReturnOrder> page = returnRepo.findAll(spec, pageable);

        return page.map(ro -> {
            List<ReturnItem> items = returnItemRepo.findByReturnOrderId(ro.getId());
            return returnOrderMapper.toResponse(ro, items);
        });
    }




    @Override
    public Page<ReturnOrderResponse> getByUserId(String userId, Pageable pageable) {
        Integer uId = Integer.valueOf(userId);
        Page<ReturnOrder> page = returnRepo.findByUserIdOrderByCreatedAtDesc(uId, pageable);

        return page.map(ro -> {
            List<ReturnItem> items = returnItemRepo.findByReturnOrderId(ro.getId());
            return returnOrderMapper.toResponse(ro, items);
        });
    }




    @Override
    public boolean hasNewReturnsAfter(long sinceMillis) {
        if (sinceMillis <= 0) return false;

        LocalDateTime since = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(sinceMillis),
                ZoneId.systemDefault()
        );

        return returnRepo.existsByCreatedAtAfter(since);
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
