package com.manfashion.springboot_be.repository.Product;

import com.manfashion.springboot_be.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product,Integer> ,ProductRepositoryCustom{
    boolean existsBySlug(String slug);
    Optional<Product> findBySlugAndDeletedAtIsNull(String slug);
    long countByCategoryIdInAndDeletedAtIsNull(List<Integer> categoryIds);
    // API 1: Tìm kiếm theo từ khóa
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.variants WHERE " +
            "(LOWER(p.name) LIKE LOWER(concat('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(concat('%', :keyword, '%'))) " +
            "AND p.isActive = true AND p.deletedAt IS NULL")
    List<Product> searchActiveProducts(@Param("keyword") String keyword);

    // API 3: Sản phẩm tương tự
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.id != :productId " +
           "AND p.isActive = true AND p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    List<Product> findSimilarProducts(@Param("categoryId") Integer categoryId, @Param("productId") Integer productId, org.springframework.data.domain.Pageable pageable);
}
