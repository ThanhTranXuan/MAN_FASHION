package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Review.ReviewRequest;
import com.manfashion.springboot_be.DTO.Review.ReviewResponse;
import com.manfashion.springboot_be.DTO.Review.ReviewSummaryResponse;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductReview;
import com.manfashion.springboot_be.entity.ReviewStatus;
import com.manfashion.springboot_be.entity.User;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.repository.Order.OrderItemRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Product.ProductReviewRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductReviewServiceImpl implements ProductReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByProduct(Integer productId, Pageable pageable) {
        return reviewRepository
                .findByProductIdAndStatusAndDeletedAtIsNull(productId, ReviewStatus.APPROVED, pageable)
                .map(this::convertToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getLatestReviews(Integer productId, Integer limit) {
        return reviewRepository
                .findLatestReviews(productId, ReviewStatus.APPROVED, PageRequest.of(0, limit))
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getReviewSummary(Integer productId) {
        Long totalReviews = reviewRepository.countByProductIdAndStatus(productId, ReviewStatus.APPROVED);
        Double averageRating = reviewRepository.getAverageRatingByProductIdAndStatus(productId, ReviewStatus.APPROVED);
        List<Object[]> counts = reviewRepository.getRatingCountsByProductIdAndStatus(productId, ReviewStatus.APPROVED);

        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingCounts.put(i, 0L);
        }
        for (Object[] count : counts) {
            ratingCounts.put((Integer) count[0], (Long) count[1]);
        }

        return ReviewSummaryResponse.builder()
                .averageRating(averageRating != null ? averageRating : 0.0)
                .totalReviews(totalReviews)
                .ratingCounts(ratingCounts)
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Integer productId, ReviewRequest request, Integer userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .purchasedSize(request.getPurchasedSize())
                .purchasedColor(request.getPurchasedColor())
                .nickname(request.getNickname())
                .gender(request.getGender())
                .location(request.getLocation())
                .status(ReviewStatus.PENDING)
                .verifiedPurchase(isVerifiedPurchase(productId, userId))
                .build();

        return convertToResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAdminReviews(ReviewStatus status, Integer rating, Integer productId, Pageable pageable) {
        return reviewRepository.findAdminReviews(status, rating, productId, pageable)
                .map(this::convertToResponse);
    }

    @Override
    @Transactional
    public ReviewResponse approveReview(Long reviewId) {
        ProductReview review = getActiveReview(reviewId);
        review.setStatus(ReviewStatus.APPROVED);
        return convertToResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public ReviewResponse rejectReview(Long reviewId) {
        ProductReview review = getActiveReview(reviewId);
        review.setStatus(ReviewStatus.REJECTED);
        return convertToResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public ReviewResponse replyReview(Long reviewId, String adminReply, Integer adminUserId) {
        ProductReview review = getActiveReview(reviewId);
        review.setAdminReply(adminReply);
        review.setAdminReplyAt(LocalDateTime.now());
        review.setAdminReplyBy(adminUserId);
        return convertToResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void softDeleteReview(Long reviewId) {
        ProductReview review = getActiveReview(reviewId);
        review.setDeletedAt(LocalDateTime.now());
        reviewRepository.save(review);
    }

    private ProductReview getActiveReview(Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        if (review.getDeletedAt() != null) {
            throw new AppException(ErrorCode.REVIEW_NOT_FOUND);
        }
        return review;
    }

    private boolean isVerifiedPurchase(Integer productId, Integer userId) {
        if (productId == null || userId == null) {
            return false;
        }
        List<String> verifiedStatuses = Arrays.asList("DELIVERED", "COMPLETED");
        return orderItemRepository.existsByProduct_IdAndOrder_User_IdAndOrder_StatusIn(productId, userId, verifiedStatuses);
    }

    private ReviewResponse convertToResponse(ProductReview review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .productName(review.getProduct() != null ? review.getProduct().getName() : null)
                .productSlug(review.getProduct() != null ? review.getProduct().getSlug() : null)
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .purchasedSize(review.getPurchasedSize())
                .purchasedColor(review.getPurchasedColor())
                .nickname(review.getNickname())
                .gender(review.getGender())
                .location(review.getLocation())
                .status(review.getStatus())
                .verifiedPurchase(Boolean.TRUE.equals(review.getVerifiedPurchase()))
                .adminReply(review.getAdminReply())
                .adminReplyAt(review.getAdminReplyAt())
                .adminReplyBy(review.getAdminReplyBy())
                .createdAt(review.getCreatedAt())
                .deletedAt(review.getDeletedAt())
                .userFullName(review.getUser() != null ? review.getUser().getFullName() : review.getNickname())
                .userAvatarUrl(review.getUser() != null ? review.getUser().getAvatarUrl() : null)
                .build();
    }
}
