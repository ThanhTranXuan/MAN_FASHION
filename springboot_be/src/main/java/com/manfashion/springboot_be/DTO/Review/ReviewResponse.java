package com.manfashion.springboot_be.DTO.Review;

import com.manfashion.springboot_be.entity.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Integer productId;
    private String productName;
    private String productSlug;
    private Integer rating;
    private String title;
    private String comment;
    private String purchasedSize;
    private String purchasedColor;
    private String nickname;
    private String gender;
    private String location;
    private ReviewStatus status;
    private Boolean verifiedPurchase;
    private String adminReply;
    private LocalDateTime adminReplyAt;
    private Integer adminReplyBy;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
    private String userFullName;
    private String userAvatarUrl;
}
