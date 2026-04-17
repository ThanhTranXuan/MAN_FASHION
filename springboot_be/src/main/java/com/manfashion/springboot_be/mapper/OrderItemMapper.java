package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Order.OrderItemResponse;
import com.manfashion.springboot_be.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    // MapStruct tự động map trường "id" của OrderItem sang "id" của OrderItemResponse

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "variant.id", target = "variantId")
    OrderItemResponse toResponse(OrderItem item);
}