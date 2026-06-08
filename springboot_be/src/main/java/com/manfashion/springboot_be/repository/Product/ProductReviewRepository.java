package com.manfashion.springboot_be.repository.Product;

import com.manfashion.springboot_be.entity.ProductReview;
import com.manfashion.springboot_be.entity.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    Page<ProductReview> findByProductIdAndStatusAndDeletedAtIsNull(Integer productId, ReviewStatus status, Pageable pageable);
    boolean existsByUser_IdAndProduct_IdAndDeletedAtIsNull(Integer userId, Integer productId);

    List<ProductReview> findByUser_IdAndProduct_IdInAndDeletedAtIsNull(Integer userId, List<Integer> productIds);

    @Query("""
            SELECT r FROM ProductReview r
            WHERE r.product.id = :productId
              AND r.status = :status
              AND r.deletedAt IS NULL
            ORDER BY r.createdAt DESC
            """)
    List<ProductReview> findLatestReviews(@Param("productId") Integer productId, @Param("status") ReviewStatus status, Pageable pageable);

    @Query("SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId AND r.status = :status AND r.deletedAt IS NULL")
    Long countByProductIdAndStatus(@Param("productId") Integer productId, @Param("status") ReviewStatus status);

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId AND r.status = :status AND r.deletedAt IS NULL")
    Double getAverageRatingByProductIdAndStatus(@Param("productId") Integer productId, @Param("status") ReviewStatus status);

    @Query("SELECT r.rating, COUNT(r) FROM ProductReview r WHERE r.product.id = :productId AND r.status = :status AND r.deletedAt IS NULL GROUP BY r.rating")
    List<Object[]> getRatingCountsByProductIdAndStatus(@Param("productId") Integer productId, @Param("status") ReviewStatus status);

    @Query("""
            SELECT r.product.id AS productId,
                   AVG(r.rating) AS averageRating,
                   COUNT(r) AS reviewCount
            FROM ProductReview r
            WHERE r.product.id IN :productIds
              AND r.status = :status
              AND r.deletedAt IS NULL
            GROUP BY r.product.id
            """)
    List<ProductRatingSummary> getRatingSummariesByProductIds(
            @Param("productIds") List<Integer> productIds,
            @Param("status") ReviewStatus status
    );

    interface ProductRatingSummary {
        Integer getProductId();
        Double getAverageRating();
        Long getReviewCount();
    }

    @Query(value = """
            SELECT r FROM ProductReview r
            LEFT JOIN FETCH r.product p
            LEFT JOIN FETCH r.user u
            WHERE r.deletedAt IS NULL
              AND (:status IS NULL OR r.status = :status)
              AND (:rating IS NULL OR r.rating = :rating)
              AND (:productId IS NULL OR p.id = :productId)
            """,
            countQuery = """
            SELECT COUNT(r) FROM ProductReview r
            LEFT JOIN r.product p
            WHERE r.deletedAt IS NULL
              AND (:status IS NULL OR r.status = :status)
              AND (:rating IS NULL OR r.rating = :rating)
              AND (:productId IS NULL OR p.id = :productId)
            """)
    Page<ProductReview> findAdminReviews(
            @Param("status") ReviewStatus status,
            @Param("rating") Integer rating,
            @Param("productId") Integer productId,
            Pageable pageable
    );
}
