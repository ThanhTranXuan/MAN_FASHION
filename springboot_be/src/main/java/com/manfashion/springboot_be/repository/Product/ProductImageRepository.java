package com.manfashion.springboot_be.repository.Product;

import com.manfashion.springboot_be.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage,Integer> {
    List<ProductImage> findByProductIdAndDeletedAtIsNull(Integer productId);
    List<ProductImage> findByProductIdInAndDeletedAtIsNull(List<Integer> productIds);
    List<ProductImage> findByProductIdAndColor(Integer productId, String color);
    List<ProductImage> findByProductIdAndColorIgnoreCaseAndDeletedAtIsNull(Integer productId, String color);
    List<ProductImage> findByProductIdAndColorIsNull(Integer productId);
    List<ProductImage> findByProductIdAndColorIsNullAndDeletedAtIsNull(Integer productId);
    List<ProductImage> findByIdInAndProductIdAndDeletedAtIsNull(List<Integer> ids, Integer productId);
    Optional<ProductImage> findFirstByProductIdAndIsThumbnailTrueAndDeletedAtIsNull(Integer id);

}
