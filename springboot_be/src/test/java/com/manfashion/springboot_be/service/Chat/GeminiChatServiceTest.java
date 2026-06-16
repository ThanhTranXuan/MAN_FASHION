package com.manfashion.springboot_be.service.Chat;

import com.manfashion.springboot_be.DTO.Chat.AdminChatbotStatsResponse;
import com.manfashion.springboot_be.DTO.Chat.BotChatResponse;
import com.manfashion.springboot_be.entity.Category;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductImage;
import com.manfashion.springboot_be.entity.ProductVariant;
import com.manfashion.springboot_be.repository.Category.CategoryRepository;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Return.ReturnOrderRepository;
import com.manfashion.springboot_be.service.Order.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GeminiChatServiceTest {
    private AdminChatbotStatsService statsService;
    private ProductRepository productRepository;
    private GeminiChatService service;

    @BeforeEach
    void setUp() {
        statsService = mock(AdminChatbotStatsService.class);
        productRepository = mock(ProductRepository.class);
        service = new GeminiChatService(
                mock(RestClient.class),
                productRepository,
                mock(CategoryRepository.class),
                mock(OrderRepository.class),
                mock(ReturnOrderRepository.class),
                mock(OrderService.class),
                statsService
        );

        when(statsService.getDashboardSummary()).thenReturn(
                AdminChatbotStatsResponse.builder()
                        .totalProducts(20)
                        .totalVariants(50)
                        .totalStock(300)
                        .lowStockItems(List.of("Áo sơ mi - Đen/L: 2"))
                        .totalOrders(100)
                        .pendingOrders(8)
                        .paidOrders(12)
                        .completedOrders(70)
                        .cancelledOrders(5)
                        .returnOrders(5)
                        .revenueToday(1_000_000)
                        .revenueThisMonth(20_000_000)
                        .totalRevenue(100_000_000)
                        .totalCustomers(40)
                        .totalEmployees(3)
                        .pendingReviews(4)
                        .pendingReturnRequests(2)
                        .latestOrder("ORD-100 - PENDING")
                        .build()
        );
    }

    @Test
    void adminCanAskDashboardSummaryUsingGenericStatisticsPhrase() {
        BotChatResponse answer = service.askBot("admin-session", "Cho tôi xem thống kê tổng quan", 1, "ADMIN");

        assertThat(answer.getMessage())
                .contains("Số liệu thật từ hệ thống")
                .contains("Sản phẩm: 20")
                .contains("Tổng đơn: 100");
    }

    @Test
    void employeeCanAskOperationalOrderStatistics() {
        BotChatResponse answer = service.askBot("employee-session", "Có bao nhiêu đơn đang chờ xử lý?", 2, "EMPLOYEE");

        assertThat(answer.getMessage())
                .contains("8 đơn chờ xử lý")
                .contains("12 đơn đã thanh toán");
    }

    @Test
    void regularUserCannotAskAdministrativeStatistics() {
        BotChatResponse answer = service.askBot("user-session", "Thống kê doanh thu tháng này", 3, "USER");

        assertThat(answer.getMessage()).contains("chỉ dành cho quản trị viên");
    }

    @Test
    void productRecommendationFallsBackWhenNoRealProductsMatch() {
        when(productRepository.findActiveBotCandidates(PageRequest.of(0, 200))).thenReturn(List.of());

        BotChatResponse answer = service.askBot(
                "product-session",
                "m7 nặng 70kg, chọn 1 set quần áo cho hè này",
                null,
                "GUEST"
        );

        assertThat(answer.getMessage()).contains("chưa có đủ sản phẩm phù hợp");
        assertThat(answer.getProducts()).isEmpty();
    }

    @Test
    void plainGreetingDoesNotTriggerProductRecommendation() {
        BotChatResponse answer = service.askBot("new-session", "xin chao", null, "GUEST");

        assertThat(answer.getProducts()).isEmpty();
        assertThat(answer.getMessage()).contains("Ch");
    }

    @Test
    void productRecommendationUsesRealBlackJacketWhenAdminStoresColorInEnglish() {
        Product jacket = product(
                12,
                "Áo khoác bomber",
                "ao-khoac-bomber",
                "Áo khoác",
                "black",
                "L"
        );
        Product tshirt = product(
                13,
                "Áo thun basic",
                "ao-thun-basic",
                "Áo thun",
                "white",
                "L"
        );
        when(productRepository.findActiveBotCandidates(PageRequest.of(0, 200))).thenReturn(List.of(tshirt, jacket));

        BotChatResponse answer = service.askBot(
                "black-jacket-session",
                "có áo khoác màu đen không",
                null,
                "GUEST"
        );

        assertThat(answer.getProducts()).extracting("name").contains("Áo khoác bomber");
        assertThat(answer.getMessage()).contains("Áo khoác bomber");
        assertThat(answer.getMessage()).doesNotContain("chưa có đủ sản phẩm");
    }

    @Test
    void greetingResetsPreviousProductContextAndDoesNotReturnProducts() {
        Product jacket = product(
                12,
                "Ão khoÃ¡c bomber",
                "ao-khoac-bomber",
                "Ão khoÃ¡c",
                "black",
                "L"
        );
        when(productRepository.findActiveBotCandidates(PageRequest.of(0, 200))).thenReturn(List.of(jacket));

        service.askBot("same-session", "co ao khoac mau den khong", null, "GUEST");
        BotChatResponse greeting = service.askBot("same-session", "xin chao", null, "GUEST");

        assertThat(greeting.getProducts()).isEmpty();
        assertThat(greeting.getMessage()).contains("Ch");
    }

    @Test
    void genericCatalogQuestionReturnsProductsWithoutCallingGeneralChat() {
        Product jacket = product(
                12,
                "Áo khoác bomber",
                "ao-khoac-bomber",
                "Áo khoác",
                "black",
                "L"
        );
        Product jeans = product(
                14,
                "Quần jeans ống suông",
                "quan-jeans-ong-suong",
                "Quần jeans",
                "blue",
                "32"
        );
        when(productRepository.findActiveBotCandidates(PageRequest.of(0, 200))).thenReturn(List.of(jacket, jeans));

        BotChatResponse answer = service.askBot(
                "catalog-session",
                "Shop có sản phẩm nào?",
                null,
                "GUEST"
        );

        assertThat(answer.getProducts())
                .extracting("name")
                .contains("Áo khoác bomber", "Quần jeans ống suông");
        assertThat(answer.getMessage())
                .contains("Áo khoác bomber")
                .contains("Quần jeans ống suông")
                .doesNotContain("1m70")
                .doesNotContain("lỗi cấu hình");
    }

    @Test
    void unaccentedGenericProductSearchDoesNotTreatNaoAsAo() {
        Product jacket = product(
                12,
                "Áo khoác bomber",
                "ao-khoac-bomber",
                "Áo khoác",
                "black",
                "L"
        );
        Product jeans = product(
                14,
                "Quần jeans ống suông",
                "quan-jeans-ong-suong",
                "Quần jeans",
                "blue",
                "32"
        );
        when(productRepository.findActiveBotCandidates(PageRequest.of(0, 200))).thenReturn(List.of(jacket, jeans));

        BotChatResponse answer = service.askBot(
                "plain-catalog-session",
                "co san pham nao khong",
                null,
                "GUEST"
        );

        assertThat(answer.getProducts())
                .extracting("name")
                .contains("Áo khoác bomber", "Quần jeans ống suông");
    }

    @Test
    void sizeAdviceIsIncludedWhenCustomerProvidesMeasurements() {
        Product jacket = product(
                12,
                "Áo khoác bomber",
                "ao-khoac-bomber",
                "Áo khoác",
                "black",
                "L"
        );
        when(productRepository.findActiveBotCandidates(PageRequest.of(0, 200))).thenReturn(List.of(jacket));

        BotChatResponse answer = service.askBot(
                "size-session",
                "Tôi cao 170cm nặng 70kg, tìm áo khoác màu đen",
                null,
                "GUEST"
        );

        assertThat(answer.getMessage())
                .contains("gợi ý size L")
                .contains("bảng size");
    }

    private Product product(Integer id, String name, String slug, String categoryName, String color, String size) {
        Category category = Category.builder()
                .name(categoryName)
                .slug(slug + "-category")
                .build();
        Product product = Product.builder()
                .id(id)
                .name(name)
                .slug(slug)
                .description(name + " " + categoryName)
                .price(399000.0)
                .category(category)
                .isActive(true)
                .build();
        product.getVariants().add(ProductVariant.builder()
                .product(product)
                .color(color)
                .size(size)
                .stock(10)
                .build());
        product.getImages().add(ProductImage.builder()
                .product(product)
                .url("https://example.com/" + slug + ".jpg")
                .isThumbnail(true)
                .build());
        return product;
    }
}
