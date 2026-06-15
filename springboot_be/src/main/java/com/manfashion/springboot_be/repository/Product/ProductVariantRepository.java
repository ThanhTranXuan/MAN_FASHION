package com.manfashion.springboot_be.repository.Product;

import com.manfashion.springboot_be.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    List<ProductVariant> findByProductIdAndDeletedAtIsNull(Integer productId);
    List<ProductVariant> findByStockLessThanAndDeletedAtIsNull(Integer stockThreshold);
    boolean existsByProductIdAndColorIgnoreCaseAndDeletedAtIsNull(Integer productId, String color);
    long countByDeletedAtIsNull();

    @Query("SELECT COALESCE(SUM(v.stock), 0) FROM ProductVariant v WHERE v.deletedAt IS NULL")
    Long sumAvailableStock();

    @Query("""
            SELECT DISTINCT v.color FROM ProductVariant v
            JOIN v.product p
            WHERE v.deletedAt IS NULL
              AND p.deletedAt IS NULL
              AND p.isActive = true
              AND v.color IS NOT NULL
              AND TRIM(v.color) <> ''
            ORDER BY v.color
            """)
    List<String> findAvailableColors();

    @Query("""
            SELECT DISTINCT v.size FROM ProductVariant v
            JOIN v.product p
            WHERE v.deletedAt IS NULL
              AND p.deletedAt IS NULL
              AND p.isActive = true
              AND v.size IS NOT NULL
              AND TRIM(v.size) <> ''
            ORDER BY v.size
            """)
    List<String> findAvailableSizes();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE ProductVariant v
            SET v.stock = v.stock - :quantity
            WHERE v.id = :variantId
              AND v.deletedAt IS NULL
              AND v.stock >= :quantity
            """)
    int decrementStockIfAvailable(@Param("variantId") Integer variantId, @Param("quantity") Integer quantity);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE ProductVariant v
            SET v.stock = v.stock + :quantity
            WHERE v.id = :variantId
            """)
    int incrementStock(@Param("variantId") Integer variantId, @Param("quantity") Integer quantity);

}
