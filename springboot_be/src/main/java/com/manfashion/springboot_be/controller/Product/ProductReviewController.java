package com.manfashion.springboot_be.controller.Product;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Review.ReviewRequest;
import com.manfashion.springboot_be.DTO.Review.ReviewResponse;
import com.manfashion.springboot_be.DTO.Review.ReviewSummaryResponse;
import com.manfashion.springboot_be.service.Product.ProductReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductReviewController {

    private final ProductReviewService reviewService;

    @GetMapping("/{productId}/reviews")
    public ApiResponse<Page<ReviewResponse>> getReviews(
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Pageable pageable = buildPageable(page, size, sort);

        return ApiResponse.<Page<ReviewResponse>>builder()
                .message("Lấy danh sách đánh giá sản phẩm thành công")
                .data(reviewService.getReviewsByProduct(productId, pageable))
                .build();
    }

    @GetMapping("/{productId}/reviews/latest")
    public ApiResponse<List<ReviewResponse>> getLatestReviews(
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "3") Integer limit
    ) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .message("Lấy đánh giá mới nhất thành công")
                .data(reviewService.getLatestReviews(productId, limit))
                .build();
    }

    @GetMapping("/{productId}/reviews/summary")
    public ApiResponse<ReviewSummaryResponse> getReviewSummary(
            @PathVariable Integer productId
    ) {
        return ApiResponse.<ReviewSummaryResponse>builder()
                .message("Lấy tổng quan đánh giá sản phẩm thành công")
                .data(reviewService.getReviewSummary(productId))
                .build();
    }

    @PostMapping("/{productId}/reviews")
    public ApiResponse<ReviewResponse> createReview(
            @PathVariable Integer productId,
            @RequestBody ReviewRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId
    ) {
        return ApiResponse.<ReviewResponse>builder()
                .message("Tạo đánh giá sản phẩm thành công")
                .data(reviewService.createReview(productId, request, userId))
                .build();
    }

    private Pageable buildPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");

        String sortField = sortParams[0];
        Sort.Direction direction = Sort.Direction.ASC;

        if (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
        }

        Sort sortObj = Sort.by(direction, sortField);

        return PageRequest.of(page, size, sortObj);
    }
}