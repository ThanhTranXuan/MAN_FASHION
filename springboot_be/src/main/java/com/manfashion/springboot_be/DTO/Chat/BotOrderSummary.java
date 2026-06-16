package com.manfashion.springboot_be.DTO.Chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BotOrderSummary {
    private String code;
    private String status;
    private String statusLabel;
    private Double total;
    private LocalDateTime createdAt;
}
