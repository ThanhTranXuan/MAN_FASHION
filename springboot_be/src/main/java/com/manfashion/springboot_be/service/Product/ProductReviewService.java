package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Review.ReviewRequest;
import com.manfashion.springboot_be.DTO.Review.ReviewResponse;
import com.manfashion.springboot_be.DTO.Review.ReviewSummaryResponse;
import com.manfashion.springboot_be.entity.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductReviewService {
    Page<ReviewResponse> getReviewsByProduct(Integer productId, Pageable pageable);
    List<ReviewResponse> getLatestReviews(Integer productId, Integer limit);
    ReviewSummaryResponse getReviewSummary(Integer productId);
    ReviewResponse createReview(Integer productId, ReviewRequest request, Integer userId);
    Page<ReviewResponse> getAdminReviews(ReviewStatus status, Integer rating, Integer productId, Pageable pageable);
    ReviewResponse approveReview(Long reviewId);
    ReviewResponse rejectReview(Long reviewId);
    ReviewResponse replyReview(Long reviewId, String adminReply, Integer adminUserId);
    void softDeleteReview(Long reviewId);
}
