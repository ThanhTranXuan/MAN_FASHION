package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Product.*;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductImage;
import com.manfashion.springboot_be.entity.ProductVariant;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    // Chuyển từ Entity sang Response DTO để trả về cho Client
    @Mapping(target = "categoryName", expression = "java(product.getCategory() != null ? product.getCategory().getName() : null)")
    @Mapping(target = "categoryId", expression = "java(product.getCategory() != null ? product.getCategory().getId() : null)")
    @Mapping(target = "salePrice", ignore = true)
    @Mapping(target = "isSale", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "reviewCount", ignore = true)
    ProductResponse toResponseDTO(Product product);

    @AfterMapping
    default void filterSoftDeletedChildren(Product product, @MappingTarget ProductResponse response) {
        if (response.getVariants() != null) {
            List<ProductVariantResponse> activeVariants = product.getVariants().stream()
                    .filter(variant -> variant.getDeletedAt() == null)
                    .map(this::toVariantResponseDTO)
                    .toList();
            response.setVariants(activeVariants);
        }

        if (response.getImages() != null) {
            List<ProductImageResponse> activeImages = product.getImages().stream()
                    .filter(image -> image.getDeletedAt() == null)
                    .map(this::toImageResponseDTO)
                    .toList();
            response.setImages(activeImages);
        }
    }

    // Chuyển từ Request DTO sang Entity để lưu vào Database (Create)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true) // Sẽ set thủ công trong Service bằng CategoryId
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Product toEntity(ProductRequest dto);

    // Cập nhật Entity hiện có từ DTO (Update)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateProductFromRequest(ProductRequest dto, @MappingTarget Product product);
    // =====================================================
    // 🎨 MAPPER CHO PRODUCT VARIANT
    // =====================================================

    ProductVariantResponse toVariantResponseDTO(ProductVariant variant);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true) // Sẽ set thủ công trong Service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    ProductVariant toVariantEntity(ProductVariantRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateVariantFromRequest(ProductVariantRequest dto, @MappingTarget ProductVariant variant);

    // =====================================================
    // 🖼️ MAPPER CHO PRODUCT IMAGE (Dùng cho ProductImageService)
    // =====================================================

    @Mapping(target = "productId", source = "product.id") // Lấy ID từ Object Product cha
    ProductImageResponse toImageResponseDTO(ProductImage image);
}
