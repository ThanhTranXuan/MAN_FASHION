package com.manfashion.springboot_be.controller.Newsletter;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Newsletter.NewsletterSubscribeRequest;
import com.manfashion.springboot_be.util.EmailTemplateBuilder;
import com.manfashion.springboot_be.util.SendMail;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/newsletter")
@RequiredArgsConstructor
public class NewsletterController {
    private final SendMail sendMail;

    @PostMapping("/subscribe")
    public ApiResponse<Void> subscribe(@Valid @RequestBody NewsletterSubscribeRequest request) {
        String html = EmailTemplateBuilder.build(
                "bạn",
                "Khám phá ưu đãi mới từ Trendify",
                """
                    Cảm ơn bạn đã quan tâm đến Trendify.<br/>
                    Ưu đãi mùa hè đang diễn ra: <b>miễn phí giao hàng cho đơn từ 500.000 ₫</b>.<br/>
                    Ghé Trendify để khám phá bộ sưu tập mới nhất và các gợi ý phối đồ phù hợp mùa này.
                """,
                "Xem ngay",
                "http://localhost:3000/user/product"
        );

        boolean sent = sendMail.sendMail(
                request.getEmail().trim(),
                "Trendify - Ưu đãi mùa hè dành cho bạn",
                html
        );

        return ApiResponse.<Void>builder()
                .message(sent
                        ? "Email ưu đãi đã được gửi"
                        : "Không thể gửi email ưu đãi. Vui lòng thử lại sau.")
                .build();
    }
}
