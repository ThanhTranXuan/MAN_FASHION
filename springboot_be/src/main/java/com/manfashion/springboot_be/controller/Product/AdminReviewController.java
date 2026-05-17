package com.manfashion.springboot_be.controller.Product;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Review.ReviewReplyRequest;
import com.manfashion.springboot_be.DTO.Review.ReviewResponse;
import com.manfashion.springboot_be.entity.ReviewStatus;
import com.manfashion.springboot_be.service.Product.ProductReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
public class AdminReviewController {

    private final ProductReviewService reviewService;

    private Integer getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (!(principal instanceof String userId) || "guest".equalsIgnoreCase(userId)) return null;
        return Integer.valueOf(userId);
    }

    @GetMapping
    public ApiResponse<Page<ReviewResponse>> getAdminReviews(
            @RequestParam(required = false) ReviewStatus status,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Integer productId,
            Pageable pageable
    ) {
        return ApiResponse.<Page<ReviewResponse>>builder()
                .message("review.admin.get_all.success")
                .data(reviewService.getAdminReviews(status, rating, productId, pageable))
                .build();
    }

    @PatchMapping("/{reviewId}/approve")
    public ApiResponse<ReviewResponse> approveReview(@PathVariable Long reviewId) {
        return ApiResponse.<ReviewResponse>builder()
                .message("review.approve.success")
                .data(reviewService.approveReview(reviewId))
                .build();
    }

    @PatchMapping("/{reviewId}/reject")
    public ApiResponse<ReviewResponse> rejectReview(@PathVariable Long reviewId) {
        return ApiResponse.<ReviewResponse>builder()
                .message("review.reject.success")
                .data(reviewService.rejectReview(reviewId))
                .build();
    }

    @PatchMapping("/{reviewId}/reply")
    public ApiResponse<ReviewResponse> replyReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewReplyRequest request
    ) {
        return ApiResponse.<ReviewResponse>builder()
                .message("review.reply.success")
                .data(reviewService.replyReview(reviewId, request.getAdminReply(), getCurrentUserId()))
                .build();
    }

    @DeleteMapping("/{reviewId}")
    public ApiResponse<Void> softDeleteReview(@PathVariable Long reviewId) {
        reviewService.softDeleteReview(reviewId);
        return ApiResponse.<Void>builder()
                .message("review.delete.success")
                .build();
    }
}
