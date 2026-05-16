package com.manfashion.springboot_be.repository.Product;

import com.manfashion.springboot_be.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    Page<ProductReview> findByProductId(Integer productId, Pageable pageable);

    @Query(value = "SELECT * FROM product_reviews WHERE product_id = :productId ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<ProductReview> findLatestReviews(@Param("productId") Integer productId, @Param("limit") Integer limit);

    @Query("SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId")
    Long countByProductId(@Param("productId") Integer productId);

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Integer productId);

    @Query("SELECT r.rating, COUNT(r) FROM ProductReview r WHERE r.product.id = :productId GROUP BY r.rating")
    List<Object[]> getRatingCountsByProductId(@Param("productId") Integer productId);
}
