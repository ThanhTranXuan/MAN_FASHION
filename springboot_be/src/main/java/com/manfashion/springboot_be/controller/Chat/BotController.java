package com.manfashion.springboot_be.controller.Chat;

import com.manfashion.springboot_be.service.Chat.DifyBotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bot")
public class BotController {

    private final DifyBotService botService;

    public BotController(DifyBotService botService) {
        this.botService = botService;
    }

    @PostMapping("/chat/{conversationId}")
    public ResponseEntity<?> chatWithBot(
            @PathVariable String conversationId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-User-Id-Hex", required = false, defaultValue = "UNKNOWN") String userIdHex) {

        try {
            String userMessage = request.get("message");

            String botSessionId = "UNKNOWN".equals(userIdHex)
                    ? conversationId
                    : userIdHex + ":" + conversationId;
            String botReply = botService.askBot(botSessionId, userMessage);

            // Đóng gói DTO khớp với Frontend ReactJS
            Map<String, Object> response = Map.of(
                    "id", UUID.randomUUID().toString(),
                    "content", botReply,
                    "senderType", "BOT",
                    "senderName", "Trendify Bot",
                    "createdAt", Instant.now().toString(),
                    "chatChannel", "BOT"
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Lỗi xử lý Bot",
                            "message", e.getMessage(),
                            "userIdHex", userIdHex
                    ));
        }
    }
    @GetMapping("/search")
    public String search(@RequestParam String keyword) {
        return botService.searchProductsForBot(keyword);
    }

    @GetMapping("/detail")
    public String detail(@RequestParam String slug) {
        return botService.getProductDetailForBot(slug);
    }

    @GetMapping("/order-status")
    public String orderStatus(@RequestParam String orderCode) {
        return botService.getOrderStatusForBot(orderCode);
    }
}
