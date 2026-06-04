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
