package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Order.OrderItemResponse;
import com.manfashion.springboot_be.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    // MapStruct tự động map trường "id" của OrderItem sang "id" của OrderItemResponse

    @Mapping(source = "product.id", target = "productId")
    @Mapping(target = "productName", expression = "java(item.getProductName() != null ? item.getProductName() : (item.getProduct() != null ? item.getProduct().getName() : null))")
    @Mapping(source = "variant.id", target = "variantId")
    @Mapping(target = "color", expression = "java(item.getVariantColor() != null ? item.getVariantColor() : (item.getVariant() != null ? item.getVariant().getColor() : null))")
    @Mapping(target = "size", expression = "java(item.getVariantSize() != null ? item.getVariantSize() : (item.getVariant() != null ? item.getVariant().getSize() : null))")
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "thumbnailUrl", ignore = true)
    OrderItemResponse toResponse(OrderItem item);

    default OrderItemResponse toResponse(OrderItem item, String imageUrl) {
        OrderItemResponse response = toResponse(item);
        String effectiveImageUrl = item.getImageUrl() != null ? item.getImageUrl() : imageUrl;
        response.setImageUrl(effectiveImageUrl);
        response.setThumbnailUrl(effectiveImageUrl);
        return response;
    }
}
