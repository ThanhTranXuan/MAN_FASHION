package com.manfashion.springboot_be.controller.Chat;

import com.manfashion.springboot_be.config.JwtUtils;
import com.manfashion.springboot_be.service.Chat.DifyBotService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bot")
@Slf4j
public class BotController {

    private final DifyBotService botService;
    private final JwtUtils jwtUtils;

    public BotController(DifyBotService botService, JwtUtils jwtUtils) {
        this.botService = botService;
        this.jwtUtils = jwtUtils;
    }

    private Integer getCurrentUserIdOrNull(String authorizationHeader) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String principal = authentication != null && authentication.getPrincipal() != null
                ? String.valueOf(authentication.getPrincipal())
                : null;

        if (principal != null && !"guest".equalsIgnoreCase(principal)) {
            try {
                return Integer.valueOf(principal);
            } catch (NumberFormatException ignored) {
                // Fall through to direct Authorization parsing below.
            }
        }

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            try {
                if (jwtUtils.validateJwtToken(token)) {
                    return Integer.valueOf(jwtUtils.getUserIdFromJwtToken(token));
                }
            } catch (Exception ex) {
                log.debug("Bot request contains an invalid bearer token", ex);
            }
        }

        log.debug(
                "Bot request has no authenticated user. hasAuthorization={}, principal={}",
                authorizationHeader != null && !authorizationHeader.isBlank(),
                principal
        );
        return null;
    }

    @PostMapping("/chat/{conversationId}")
    public ResponseEntity<?> chatWithBot(
            @PathVariable String conversationId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestHeader(value = "X-User-Id-Hex", required = false, defaultValue = "UNKNOWN") String userIdHex) {

        try {
            String userMessage = request.get("message");

            String botSessionId = "UNKNOWN".equals(userIdHex)
                    ? conversationId
                    : userIdHex + ":" + conversationId;
            String botReply = botService.askBot(botSessionId, userMessage, getCurrentUserIdOrNull(authorizationHeader));

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
