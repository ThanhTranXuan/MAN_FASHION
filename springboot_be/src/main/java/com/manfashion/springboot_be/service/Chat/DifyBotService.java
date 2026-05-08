package com.manfashion.springboot_be.service.Chat;

import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

    @Service
    @RequiredArgsConstructor
    public class DifyBotService {

        private final RestClient restClient;
        private final ProductRepository productRepository;
        private final OrderRepository orderRepository;
        @Value("${dify.api-key}")
        private String apiKey;

        @Value("${dify.url}")
        private String apiUrl;


        public String askBot(String sessionId, String userMessage) {
            Map<String, Object> requestBody = Map.of(
                    // Các biến khai báo ở nút START phải nằm trong inputs
                    "inputs", Map.of(
                            "query", userMessage
                    ),
                    // query ở ngoài này là nội dung tin nhắn để Chatbot xử lý
                    "query", userMessage,
                    "response_mode", "blocking",
                    "user", sessionId
            );

            // 2. Gọi sang server Dify
            try {
                Map response = restClient.post()
                        .uri(apiUrl)
                        .header("Authorization", "Bearer " + apiKey)
                        .body(requestBody)
                        .retrieve()
                        .body(Map.class);

                // 3. Dify trả câu trả lời trong trường "answer"
                return (String) response.get("answer");

            } catch (Exception e) {
                // Log lỗi để dễ debug nếu Dify sập hoặc sai Key
                System.err.println("Lỗi gọi Dify: " + e.getMessage());
                return "Xin lỗi, hệ thống tư vấn đang bận. Bạn vui lòng thử lại sau nhé!";
            }
        }
        // 1. Tool Tìm kiếm sản phẩm tổng quát
        public String searchProductsForBot(String keyword) {
            List<Product> products = productRepository.searchActiveProducts(keyword);
            if (products.isEmpty()) return "KHO: Không tìm thấy sản phẩm nào cho từ khóa '" + keyword + "'.";

            StringBuilder sb = new StringBuilder("KẾT QUẢ TÌM KIẾM:\n");
            products.forEach(p -> {
                sb.append(String.format("- %s (Giá: %.0f VNĐ) - Slug: %s\n", p.getName(), p.getPrice(), p.getSlug()));
            });
            System.out.println("Dữ liệu gửi sang Dify: " + sb);
            return sb.toString();
        }

        // 2. Tool Kiểm tra tồn kho & Chi tiết
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

        // 3. Tool Tra cứu trạng thái đơn hàng
        public String getOrderStatusForBot(String orderCode) {
            return orderRepository.findByOrderCode(orderCode)
                    .map(o -> String.format("ĐƠN HÀNG %s:\n- Trạng thái: %s\n- Tổng tiền: %.0f VNĐ\n- Người nhận: %s\n- Địa chỉ: %s",
                            o.getOrderCode(), o.getStatus(), o.getFinalTotal(), o.getFullName(), o.getAddress()))
                    .orElse("LỖI: Không tìm thấy đơn hàng có mã " + orderCode);
        }
    }
