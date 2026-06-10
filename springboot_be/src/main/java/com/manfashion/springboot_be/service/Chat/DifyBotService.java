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
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.net.http.HttpTimeoutException;
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

    @Value("${dify.request-timeout-seconds:60}")
    private long requestTimeoutSeconds;

    private final Map<String, String> difyConversationIds = new ConcurrentHashMap<>();

    private static final String TIMEOUT_MESSAGE =
            "Hiện tại trợ lý phản hồi hơi chậm. Bạn thử gửi lại câu hỏi ngắn hơn hoặc thử lại sau ít phút nhé.";
    private static final String CONFIG_MESSAGE =
            "Trợ lý đang gặp lỗi cấu hình. Vui lòng thử lại sau.";
    private static final String RATE_LIMIT_MESSAGE =
            "Trợ lý đang nhận quá nhiều yêu cầu. Bạn thử lại sau ít phút nhé.";
    private static final String SERVER_ERROR_MESSAGE =
            "Dịch vụ trợ lý đang bận. Bạn vui lòng thử lại sau nhé.";
    private static final String INVALID_RESPONSE_MESSAGE =
            "Trợ lý chưa nhận được phản hồi phù hợp. Bạn thử hỏi lại rõ hơn nhé.";

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

        if (apiKey == null || apiKey.isBlank()) {
            log.error("Dify API key is not configured");
            return CONFIG_MESSAGE;
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

            if (response == null) {
                log.warn("Dify returned an empty response body");
                return INVALID_RESPONSE_MESSAGE;
            }

            Object returnedConversationId = response.get("conversation_id");
            if (returnedConversationId instanceof String id && !id.isBlank()) {
                difyConversationIds.put(sessionId, id);
            }

            String answer = extractDifyAnswer(response);
            if (answer == null) {
                Object rawAnswer = response.get("answer");
                log.warn(
                        "Dify response did not contain a usable answer. event={}, mode={}, taskId={}, messageId={}, answerType={}, answerLength={}, responseKeys={}",
                        response.get("event"),
                        response.get("mode"),
                        response.get("task_id"),
                        response.get("message_id"),
                        rawAnswer == null ? "null" : rawAnswer.getClass().getSimpleName(),
                        rawAnswer instanceof CharSequence value ? value.length() : null,
                        response.keySet()
                );
                return INVALID_RESPONSE_MESSAGE;
            }
            return answer;
        } catch (ResourceAccessException e) {
            if (hasCause(e, HttpTimeoutException.class)
                    || containsIgnoreCase(e.getMessage(), "timeout")
                    || containsIgnoreCase(e.getMessage(), "request cancelled")) {
                log.warn("Dify request timeout after {} seconds", requestTimeoutSeconds);
                return TIMEOUT_MESSAGE;
            }
            log.error("Failed to access Dify API", e);
            return SERVER_ERROR_MESSAGE;
        } catch (HttpClientErrorException e) {
            HttpStatusCode status = e.getStatusCode();
            String responseBody = e.getResponseBodyAsString();
            if (status.value() == 401 || status.value() == 403) {
                log.error("Dify API key invalid or unauthorized. status={}", status.value());
                return CONFIG_MESSAGE;
            }
            if (status.value() == 429 || isUpstreamRateLimit(responseBody)) {
                log.warn("Dify rate limit. status={}, upstreamRateLimit={}", status.value(), status.value() != 429);
                return RATE_LIMIT_MESSAGE;
            }
            log.error(
                    "Dify client error. status={}, code={}, message={}",
                    status.value(),
                    extractJsonField(responseBody, "code"),
                    abbreviate(extractJsonField(responseBody, "message"), 300)
            );
            return SERVER_ERROR_MESSAGE;
        } catch (HttpServerErrorException e) {
            log.error("Dify server error. status={}", e.getStatusCode().value());
            return SERVER_ERROR_MESSAGE;
        } catch (Exception e) {
            log.error("Failed to call Dify", e);
            return INVALID_RESPONSE_MESSAGE;
        }
    }

    private boolean containsIgnoreCase(String value, String expected) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(expected.toLowerCase(Locale.ROOT));
    }

    private boolean isUpstreamRateLimit(String responseBody) {
        return containsIgnoreCase(responseBody, "resource_exhausted")
                || containsIgnoreCase(responseBody, "quota exceeded")
                || containsIgnoreCase(responseBody, "rate limit")
                || containsIgnoreCase(responseBody, "\"code\": 429")
                || containsIgnoreCase(responseBody, "\"code\":429");
    }

    private String extractJsonField(String json, String fieldName) {
        if (json == null || json.isBlank()) return null;
        Matcher matcher = Pattern.compile(
                "\"" + Pattern.quote(fieldName) + "\"\\s*:\\s*\"([^\"]*)\"",
                Pattern.CASE_INSENSITIVE
        ).matcher(json);
        return matcher.find() ? matcher.group(1) : null;
    }

    private String abbreviate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) return value;
        return value.substring(0, maxLength) + "...";
    }

    private String extractDifyAnswer(Map<?, ?> response) {
        String directAnswer = nonBlankText(response.get("answer"));
        if (directAnswer != null) return directAnswer;

        Object data = response.get("data");
        if (data instanceof Map<?, ?> dataMap) {
            String nestedAnswer = nonBlankText(dataMap.get("answer"));
            if (nestedAnswer != null) return nestedAnswer;

            Object outputs = dataMap.get("outputs");
            if (outputs instanceof Map<?, ?> outputsMap) {
                for (String key : List.of("answer", "text", "output", "result")) {
                    String output = nonBlankText(outputsMap.get(key));
                    if (output != null) return output;
                }
            }
        }
        return null;
    }

    private String nonBlankText(Object value) {
        if (!(value instanceof CharSequence text)) return null;
        String normalized = text.toString().trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private boolean hasCause(Throwable throwable, Class<? extends Throwable> causeType) {
        Throwable current = throwable;
        while (current != null) {
            if (causeType.isInstance(current)) return true;
            current = current.getCause();
        }
        return false;
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
        boolean asksAccount = containsAny(normalized,
                "tai khoan cua toi",
                "ho so cua toi",
                "thong tin ca nhan",
                "profile cua toi",
                "dia chi cua toi",
                "so dien thoai cua toi",
                "email cua toi"
        );

        Matcher orderCodeMatcher = ORDER_CODE_PATTERN.matcher(userMessage == null ? "" : userMessage);
        if (!asksOrder && !asksReturn && !asksAccount && !orderCodeMatcher.find()) {
            return Optional.empty();
        }

        if (currentUserId == null) {
            if (asksAccount) {
                return Optional.of("Bạn cần đăng nhập để mình hỗ trợ thông tin tài khoản hoặc hồ sơ cá nhân.");
            }
            return Optional.of(asksReturn
                    ? "Bạn cần đăng nhập để mình kiểm tra đơn hoàn trả giúp bạn."
                    : "Bạn cần đăng nhập để mình kiểm tra đơn hàng giúp bạn.");
        }

        if (asksAccount && !asksOrder && !asksReturn) {
            return Optional.empty();
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
