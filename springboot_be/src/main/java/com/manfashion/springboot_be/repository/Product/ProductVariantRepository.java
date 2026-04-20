package com.manfashion.springboot_be.repository.Product;

import com.manfashion.springboot_be.entity.ProductVariant;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    List<ProductVariant> findByProductIdAndDeletedAtIsNull(Integer productId);
    List<ProductVariant> findByStockLessThanAndDeletedAtIsNull(Integer stockThreshold);

}
