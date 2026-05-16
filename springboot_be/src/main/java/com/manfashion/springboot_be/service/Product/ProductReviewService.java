package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Review.ReviewRequest;
import com.manfashion.springboot_be.DTO.Review.ReviewResponse;
import com.manfashion.springboot_be.DTO.Review.ReviewSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductReviewService {
    Page<ReviewResponse> getReviewsByProduct(Integer productId, Pageable pageable);
    List<ReviewResponse> getLatestReviews(Integer productId, Integer limit);
    ReviewSummaryResponse getReviewSummary(Integer productId);
    ReviewResponse createReview(Integer productId, ReviewRequest request, Integer userId);
}
