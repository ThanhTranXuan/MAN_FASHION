package com.manfashion.springboot_be.repository.Product;

import com.manfashion.springboot_be.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product,Integer> ,ProductRepositoryCustom{
    boolean existsBySlug(String slug);
    Optional<Product> findBySlugAndDeletedAtIsNull(String slug);
    long countByCategoryIdInAndDeletedAtIsNull(List<Integer> categoryIds);
}
