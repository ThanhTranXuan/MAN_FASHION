package com.manfashion.springboot_be.controller.Chat;

import com.manfashion.springboot_be.DTO.Chat.BotChatResponse;
import com.manfashion.springboot_be.config.JwtUtils;
import com.manfashion.springboot_be.repository.User.UserRepository;
import com.manfashion.springboot_be.service.Chat.GeminiChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bot")
@Slf4j
public class BotController {

    private final GeminiChatService botService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public BotController(
            GeminiChatService botService,
            JwtUtils jwtUtils,
            UserRepository userRepository) {
        this.botService = botService;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
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

    private String resolveRole(Integer currentUserId, String authorizationHeader) {
        if (currentUserId != null) {
            String databaseRole = userRepository.findById(currentUserId)
                    .map(user -> user.getRole() == null ? null : user.getRole().getName())
                    .orElse(null);
            if (databaseRole != null && !databaseRole.isBlank()) {
                return databaseRole;
            }
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String securityRole = authentication == null
                ? null
                : authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority())
                .orElse(null);
        if (securityRole != null && !"GUEST".equalsIgnoreCase(securityRole)) {
            return securityRole;
        }

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            try {
                String token = authorizationHeader.substring(7);
                if (jwtUtils.validateJwtToken(token)) {
                    return jwtUtils.getRoleFromJwtToken(token);
                }
            } catch (Exception ex) {
                log.debug("Could not resolve bot role from bearer token", ex);
            }
        }
        return "GUEST";
    }

    @PostMapping("/chat/{conversationId}")
    public ResponseEntity<?> chatWithBot(
            @PathVariable String conversationId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestHeader(value = "X-User-Id-Hex", required = false, defaultValue = "UNKNOWN") String userIdHex) {

        try {
            String userMessage = request.get("message");

            Integer currentUserId = getCurrentUserIdOrNull(authorizationHeader);
            String role = resolveRole(currentUserId, authorizationHeader);
            String botSessionId = currentUserId == null
                    ? "guest:" + conversationId
                    : "user:" + currentUserId + ":" + conversationId;
            log.info("Bot request received. conversationId={}, userId={}, role={}, message={}",
                    conversationId, currentUserId, role, userMessage);
            BotChatResponse botReply = botService.askBot(botSessionId, userMessage, currentUserId, role);


            Map<String, Object> response = new HashMap<>();
            response.put("id", UUID.randomUUID().toString());
            response.put("type", botReply.getType());
            response.put("content", botReply.getMessage());
            response.put("products", botReply.getProducts());
            response.put("categories", botReply.getCategories());
            response.put("orders", botReply.getOrders());
            response.put("outfit", botReply.getOutfit());
            response.put("suggestedQuestions", botReply.getSuggestedQuestions());
            response.put("senderType", "BOT");
            response.put("senderName", "Trendify Bot");
            response.put("createdAt", Instant.now().toString());
            response.put("chatChannel", "BOT");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Unexpected error while processing bot request. conversationId={}", conversationId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "BOT_PROCESSING_ERROR",
                            "message", "Trợ lý đang gặp sự cố. Bạn vui lòng thử lại sau."
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
    public String orderStatus(
            @RequestParam String orderCode,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        Integer currentUserId = getCurrentUserIdOrNull(authorizationHeader);
        String role = resolveRole(currentUserId, authorizationHeader);
        return botService.getOrderStatusForBot(orderCode, currentUserId, role);
    }
}
