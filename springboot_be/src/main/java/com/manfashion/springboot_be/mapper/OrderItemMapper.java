package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Order.OrderItemResponse;
import com.manfashion.springboot_be.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    // MapStruct tự động map trường "id" của OrderItem sang "id" của OrderItemResponse

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "variant.id", target = "variantId")
    @Mapping(source = "variant.color", target = "color")
    @Mapping(source = "variant.size", target = "size")
    OrderItemResponse toResponse(OrderItem item);
}
