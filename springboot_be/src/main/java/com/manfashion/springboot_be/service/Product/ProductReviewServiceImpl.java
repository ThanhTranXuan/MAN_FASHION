package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Review.ReviewRequest;
import com.manfashion.springboot_be.DTO.Review.ReviewResponse;
import com.manfashion.springboot_be.DTO.Review.ReviewSummaryResponse;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductReview;
import com.manfashion.springboot_be.entity.User;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Product.ProductReviewRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    public Page<ReviewResponse> getReviewsByProduct(Integer productId, Pageable pageable) {
        return reviewRepository.findByProductId(productId, pageable)
                .map(this::convertToResponse);
    }

    @Override
    public List<ReviewResponse> getLatestReviews(Integer productId, Integer limit) {
        return reviewRepository.findLatestReviews(productId, limit).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewSummaryResponse getReviewSummary(Integer productId) {
        Long totalReviews = reviewRepository.countByProductId(productId);
        Double averageRating = reviewRepository.getAverageRatingByProductId(productId);
        List<Object[]> counts = reviewRepository.getRatingCountsByProductId(productId);

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
                .build();

        return convertToResponse(reviewRepository.save(review));
    }

    private ReviewResponse convertToResponse(ProductReview review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .purchasedSize(review.getPurchasedSize())
                .purchasedColor(review.getPurchasedColor())
                .nickname(review.getNickname())
                .gender(review.getGender())
                .location(review.getLocation())
                .helpfulCount(review.getHelpfulCount())
                .createdAt(review.getCreatedAt())
                .userFullName(review.getUser() != null ? review.getUser().getFullName() : review.getNickname())
                .userAvatarUrl(review.getUser() != null ? review.getUser().getAvatarUrl() : null)
                .build();
    }
}
