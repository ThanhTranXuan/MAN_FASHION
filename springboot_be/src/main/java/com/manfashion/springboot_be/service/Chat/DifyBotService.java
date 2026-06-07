package com.manfashion.springboot_be.service.Chat;

import com.manfashion.springboot_be.DTO.Order.OrderItemResponse;
import com.manfashion.springboot_be.DTO.Order.OrderResponse;
import com.manfashion.springboot_be.DTO.Return.ReturnOrderResponse;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.service.Order.OrderService;
import com.manfashion.springboot_be.service.Return.ReturnOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.text.Normalizer;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class DifyBotService {

    private final RestClient restClient;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final ReturnOrderService returnOrderService;

    @Value("${dify.api-key}")
    private String apiKey;

    @Value("${dify.url}")
    private String apiUrl;

    private final Map<String, String> difyConversationIds = new ConcurrentHashMap<>();

    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("\\bORD-[A-Z0-9-]+\\b", Pattern.CASE_INSENSITIVE);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final NumberFormat VND_FORMATTER = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("vi-VN"));
    private static final Set<String> RETURN_ORDER_STATUSES = Set.of("RETURN", "RETURNED", "REFUNDED");

    public String askBot(String sessionId, String userMessage) {
        return askBot(sessionId, userMessage, null);
    }

    public String askBot(String sessionId, String userMessage, Integer currentUserId) {
        Optional<String> accountAnswer = answerAccountIntent(userMessage, currentUserId);
        if (accountAnswer.isPresent()) {
            return accountAnswer.get();
        }

        Map<String, Object> requestBody = new HashMap<>(Map.of(
                "inputs", Map.of("query", userMessage),
                "query", userMessage,
                "response_mode", "blocking",
                "user", sessionId
        ));

        String difyConversationId = difyConversationIds.get(sessionId);
        if (difyConversationId != null && !difyConversationId.isBlank()) {
            requestBody.put("conversation_id", difyConversationId);
        }

        try {
            Map response = restClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            Object returnedConversationId = response.get("conversation_id");
            if (returnedConversationId instanceof String id && !id.isBlank()) {
                difyConversationIds.put(sessionId, id);
            }

            return (String) response.get("answer");
        } catch (Exception e) {
            log.error("Failed to call Dify", e);
            return "Xin lỗi, hệ thống tư vấn đang bận. Bạn vui lòng thử lại sau nhé!";
        }
    }

    public String searchProductsForBot(String keyword) {
        List<Product> products = productRepository.searchActiveProducts(keyword);
        if (products.isEmpty()) return "KHO: Không tìm thấy sản phẩm nào cho từ khóa '" + keyword + "'.";

        StringBuilder sb = new StringBuilder("KẾT QUẢ TÌM KIẾM:\n");
        products.forEach(p -> sb.append(String.format("- %s (Giá: %.0f VNĐ) - Slug: %s\n", p.getName(), p.getPrice(), p.getSlug())));
        log.debug("Product data sent to Dify: {}", sb);
        return sb.toString();
    }

    public String getProductDetailForBot(String slug) {
        return productRepository.findBySlugAndDeletedAtIsNull(slug)
                .map(p -> {
                    StringBuilder sb = new StringBuilder(String.format("CHI TIẾT: %s\n- Mô tả: %s\n- Tồn kho:\n", p.getName(), p.getDescription()));
                    p.getVariants().stream()
                            .filter(v -> v.getDeletedAt() == null)
                            .forEach(v -> sb.append(String.format("  + Màu %s, Size %s: Còn %d cái\n", v.getColor(), v.getSize(), v.getStock())));
                    return sb.toString();
                }).orElse("LỖI: Không tìm thấy thông tin chi tiết cho mã này.");
    }

    public String getOrderStatusForBot(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .map(o -> String.format("ĐƠN HÀNG %s:\n- Trạng thái: %s\n- Tổng tiền: %.0f VNĐ\n- Người nhận: %s\n- Địa chỉ: %s",
                        o.getOrderCode(), translateOrderStatus(o.getStatus()), o.getFinalTotal(), o.getFullName(), o.getAddress()))
                .orElse("LỖI: Không tìm thấy đơn hàng có mã " + orderCode);
    }

    private Optional<String> answerAccountIntent(String userMessage, Integer currentUserId) {
        String normalized = normalize(userMessage);
        boolean asksReturn = containsAny(normalized,
                "don hang da tra lai",
                "don da tra lai",
                "don hoan tra",
                "don hang hoan tra",
                "don return",
                "yeu cau hoan tra",
                "don tra lai",
                "trang thai hoan tra",
                "lich su hoan tra",
                "don nao da hoan",
                "toi co don tra lai nao khong",
                "cac don bi tra lai cua toi"
        );
        boolean asksOrder = containsAny(normalized,
                "don hang gan day",
                "don hang moi nhat",
                "tinh trang don hang",
                "don hang cua toi",
                "kiem tra don hang",
                "toi da dat nhung don nao",
                "don gan nhat cua toi",
                "trang thai don cua toi"
        );

        Matcher orderCodeMatcher = ORDER_CODE_PATTERN.matcher(userMessage == null ? "" : userMessage);
        if (!asksOrder && !asksReturn && !orderCodeMatcher.find()) {
            return Optional.empty();
        }

        if (currentUserId == null) {
            return Optional.of(asksReturn
                    ? "Bạn cần đăng nhập để mình kiểm tra đơn hoàn trả giúp bạn."
                    : "Bạn cần đăng nhập để mình kiểm tra đơn hàng giúp bạn.");
        }

        if (asksReturn) {
            return Optional.of(formatReturnedOrdersAndRequests(currentUserId));
        }

        orderCodeMatcher.reset();
        if (orderCodeMatcher.find()) {
            String orderCode = orderCodeMatcher.group().toUpperCase(Locale.ROOT);
            return Optional.of(formatOrderByCodeForUser(orderCode, currentUserId));
        }

        return Optional.of(formatRecentOrders(currentUserId));
    }

    private String formatRecentOrders(Integer userId) {
        Page<OrderResponse> orders = orderService.getOrdersByUserId(userId, PageRequest.of(0, 5));
        if (orders.isEmpty()) {
            return "Bạn chưa có đơn hàng nào.";
        }

        StringBuilder builder = new StringBuilder("Mình tìm thấy ")
                .append(orders.getNumberOfElements())
                .append(" đơn hàng gần đây của bạn:\n\n");

        int index = 1;
        for (OrderResponse order : orders.getContent()) {
            appendOrderSummary(builder, index++, order);
        }

        builder.append("Bạn có thể vào Lịch sử mua hàng để xem chi tiết từng đơn.");
        return builder.toString();
    }

    private String formatOrderByCodeForUser(String orderCode, Integer userId) {
        return orderRepository.findByOrderCodeAndUserId(orderCode, userId)
                .map(order -> {
                    Page<OrderResponse> orders = orderService.getOrdersByUserId(userId, PageRequest.of(0, 50));
                    return orders.getContent().stream()
                            .filter(item -> orderCode.equalsIgnoreCase(item.getOrderCode()))
                            .findFirst()
                            .map(item -> {
                                StringBuilder builder = new StringBuilder("Mình tìm thấy đơn hàng của bạn:\n\n");
                                appendOrderSummary(builder, 1, item);
                                return builder.toString();
                            })
                            .orElse("Mình tìm thấy đơn " + orderCode + " của bạn, nhưng chưa lấy được chi tiết hiển thị. Bạn có thể xem trong Lịch sử mua hàng.");
                })
                .orElse("Mình không tìm thấy đơn hàng " + orderCode + " trong tài khoản của bạn.");
    }

    private String formatReturnedOrdersAndRequests(Integer userId) {
        Page<OrderResponse> orderPage = orderService.getOrdersByUserId(userId, PageRequest.of(0, 20));
        List<OrderResponse> returnedOrders = orderPage.getContent().stream()
                .filter(order -> RETURN_ORDER_STATUSES.contains(String.valueOf(order.getStatus()).toUpperCase(Locale.ROOT)))
                .limit(5)
                .toList();

        Page<ReturnOrderResponse> returnPage = returnOrderService.getByUserId(String.valueOf(userId), PageRequest.of(0, 5));

        if (returnedOrders.isEmpty() && returnPage.isEmpty()) {
            return "Bạn chưa có đơn hoàn trả nào.";
        }

        if (!returnedOrders.isEmpty()) {
            StringBuilder builder = new StringBuilder("Mình tìm thấy ")
                    .append(returnedOrders.size())
                    .append(" đơn hàng đã trả lại của bạn:\n\n");

            int index = 1;
            for (OrderResponse order : returnedOrders) {
                appendOrderSummary(builder, index++, order);
            }

            builder.append("Bạn có thể vào Lịch sử mua hàng để xem chi tiết.");
            return builder.toString();
        }

        return formatRecentReturns(returnPage);
    }

    private String formatRecentReturns(Page<ReturnOrderResponse> returns) {
        if (returns.isEmpty()) {
            return "Bạn chưa có đơn hoàn trả nào.";
        }

        StringBuilder builder = new StringBuilder("Mình tìm thấy ")
                .append(returns.getNumberOfElements())
                .append(" yêu cầu hoàn trả của bạn:\n\n");

        int index = 1;
        for (ReturnOrderResponse returnOrder : returns.getContent()) {
            builder.append(index++).append(". Đơn ")
                    .append(valueOrDash(returnOrder.getOrderCode())).append("\n")
                    .append("   - Mã hoàn trả: ").append(valueOrDash(returnOrder.getReturnCode())).append("\n")
                    .append("   - Trạng thái hoàn trả: ").append(translateReturnStatus(returnOrder.getStatus())).append("\n")
                    .append("   - Ngày yêu cầu: ").append(formatDate(returnOrder.getCreatedAt())).append("\n")
                    .append("   - Lý do: ").append(valueOrDash(returnOrder.getReason())).append("\n")
                    .append("   - Số tiền hoàn dự kiến: ").append(formatMoney(returnOrder.getRefundAmount())).append("\n\n");
        }

        builder.append("Bạn có thể vào mục Lịch sử đơn hàng/Hoàn trả để xem thêm.");
        return builder.toString();
    }

    private void appendOrderSummary(StringBuilder builder, int index, OrderResponse order) {
        int itemCount = order.getItems() == null ? 0 : order.getItems().stream()
                .map(OrderItemResponse::getQuantity)
                .filter(quantity -> quantity != null)
                .mapToInt(Integer::intValue)
                .sum();

        builder.append(index).append(". ").append(valueOrDash(order.getOrderCode())).append("\n")
                .append("   - Ngày đặt: ").append(formatDate(order.getCreatedAt())).append("\n")
                .append("   - Trạng thái: ").append(translateOrderStatus(order.getStatus())).append("\n")
                .append("   - Tổng tiền: ").append(formatMoney(order.getFinalTotal())).append("\n")
                .append("   - Số sản phẩm: ").append(itemCount).append("\n")
                .append("   - Phương thức thanh toán: ").append(translatePaymentMethod(order.getPaymentMethod())).append("\n\n");
    }

    private String normalize(String value) {
        if (value == null) return "";
        String lower = value.toLowerCase(Locale.ROOT);
        String withoutAccent = Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return withoutAccent.replace('đ', 'd');
    }

    private boolean containsAny(String value, String... needles) {
        for (String needle : needles) {
            if (value.contains(needle)) return true;
        }
        return false;
    }

    private String translateOrderStatus(String status) {
        if (status == null || status.isBlank()) return "Không xác định";
        return switch (status.toUpperCase(Locale.ROOT)) {
            case "PENDING" -> "Chờ xác nhận";
            case "CONFIRMED" -> "Đã xác nhận";
            case "PROCESSING" -> "Đang xử lý";
            case "SHIPPING", "SHIPPED", "DELIVERING" -> "Đang giao hàng";
            case "DELIVERED" -> "Đã giao hàng";
            case "COMPLETED" -> "Hoàn thành";
            case "CANCELLED" -> "Đã hủy";
            case "RETURN", "RETURNED" -> "Đã trả lại";
            case "REFUNDING" -> "Đang hoàn tiền";
            case "REFUNDED" -> "Đã hoàn tiền";
            case "FAILED" -> "Thất bại";
            case "PAID" -> "Đã thanh toán";
            default -> status;
        };
    }

    private String translatePaymentMethod(String method) {
        if (method == null || method.isBlank()) return "Không xác định";
        return switch (method.toUpperCase(Locale.ROOT)) {
            case "COD" -> "Thanh toán khi nhận hàng";
            case "VIETQR" -> "VietQR";
            case "PAYOS" -> "PayOS";
            case "BANK_TRANSFER" -> "Chuyển khoản ngân hàng";
            case "CASH" -> "Tiền mặt";
            default -> method;
        };
    }

    private String translateReturnStatus(String status) {
        if (status == null || status.isBlank()) return "Không xác định";
        return switch (status.toUpperCase(Locale.ROOT)) {
            case "REQUESTED" -> "Đã gửi yêu cầu";
            case "PENDING" -> "Chờ xử lý";
            case "APPROVED" -> "Đã duyệt";
            case "REJECTED" -> "Đã từ chối";
            case "RECEIVED" -> "Đã nhận hàng trả";
            case "PROCESSING" -> "Đang xử lý";
            case "COMPLETED" -> "Hoàn tất hoàn trả";
            case "CANCELLED" -> "Đã hủy";
            default -> status;
        };
    }

    private String formatDate(LocalDateTime dateTime) {
        return dateTime == null ? "-" : dateTime.format(DATE_FORMATTER);
    }

    private String formatMoney(Double amount) {
        return amount == null ? "-" : VND_FORMATTER.format(amount);
    }

    private String valueOrDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}
