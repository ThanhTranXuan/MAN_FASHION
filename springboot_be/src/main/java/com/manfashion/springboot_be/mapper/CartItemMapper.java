package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Cart.CartItemResponse;
import com.manfashion.springboot_be.entity.CartItem;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartItemMapper {

    // Ép kiểu ID gốc của item
    @Mapping(target = "id", expression = "java(item.getId() != null ? String.valueOf(item.getId()) : null)")

    // Check null qua 2 tầng (Object -> ID) rồi mới ép kiểu thành String
    @Mapping(target = "cartId", expression = "java(item.getCart() != null && item.getCart().getId() != null ? String.valueOf(item.getCart().getId()) : null)")
    @Mapping(target = "productId", expression = "java(item.getProduct() != null && item.getProduct().getId() != null ? String.valueOf(item.getProduct().getId()) : null)")
    @Mapping(target = "variantId", expression = "java(item.getVariant() != null && item.getVariant().getId() != null ? String.valueOf(item.getVariant().getId()) : null)")

    // Các tham số truyền thêm vào thì chỉ cần dùng source cho gọn
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "price", source = "product.price")
    @Mapping(target = "color", source = "variant.color")
    @Mapping(target = "size", source = "variant.size")
    @Mapping(target = "thumbnailUrl", source = "thumbnailUrl")
    CartItemResponse toResponseDTO(CartItem item, Product product, ProductVariant variant, String thumbnailUrl);
}
