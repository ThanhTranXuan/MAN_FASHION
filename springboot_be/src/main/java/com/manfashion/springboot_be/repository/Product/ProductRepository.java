package com.manfashion.springboot_be.repository.Product;

import com.manfashion.springboot_be.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product,Integer> ,ProductRepositoryCustom{
    boolean existsBySlug(String slug);
    long countByDeletedAtIsNull();
    Optional<Product> findBySlugAndDeletedAtIsNull(String slug);
    long countByCategoryIdInAndDeletedAtIsNull(List<Integer> categoryIds);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.variants WHERE " +
            "(LOWER(p.name) LIKE LOWER(concat('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(concat('%', :keyword, '%'))) " +
            "AND p.isActive = true AND p.deletedAt IS NULL")
    List<Product> searchActiveProducts(@Param("keyword") String keyword);

    @Query("""
            SELECT DISTINCT p FROM Product p
            LEFT JOIN FETCH p.category
            WHERE p.isActive = true
              AND p.deletedAt IS NULL
              AND p.price IS NOT NULL
              AND p.price > 0
              AND EXISTS (
                  SELECT 1 FROM ProductVariant v
                  WHERE v.product = p
                    AND v.deletedAt IS NULL
                    AND v.stock > 0
              )
              AND EXISTS (
                  SELECT 1 FROM ProductImage i
                  WHERE i.product = p
                    AND i.deletedAt IS NULL
                    AND i.url IS NOT NULL
                    AND i.url <> ''
              )
            ORDER BY p.createdAt DESC
            """)
    List<Product> findActiveBotCandidates(Pageable pageable);

    @Query("""
            SELECT DISTINCT p FROM Product p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.variants
            WHERE p.deletedAt IS NULL
            ORDER BY p.name ASC
            """)
    List<Product> findAllWithVariantsForAdmin();

    @Query(value = """
            SELECT
                COALESCE(c.id, 0) AS category_id,
                COALESCE(c.name, 'Chưa phân loại') AS category_name,
                COUNT(DISTINCT p.id) AS product_count,
                COALESCE(SUM(CASE WHEN v.deleted_at IS NULL THEN v.stock ELSE 0 END), 0) AS total_stock
            FROM products p
            LEFT JOIN categories c
                ON c.id = p.category_id
                AND c.deleted_at IS NULL
            LEFT JOIN product_variants v
                ON v.product_id = p.id
                AND v.deleted_at IS NULL
            WHERE p.deleted_at IS NULL
            GROUP BY COALESCE(c.id, 0), COALESCE(c.name, 'Chưa phân loại')
            ORDER BY product_count DESC, total_stock DESC, category_name ASC
            """, nativeQuery = true)
    List<Object[]> getProductCategorySummary();


    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.id != :productId " +
           "AND p.isActive = true AND p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    List<Product> findSimilarProducts(@Param("categoryId") Integer categoryId, @Param("productId") Integer productId, org.springframework.data.domain.Pageable pageable);
}
