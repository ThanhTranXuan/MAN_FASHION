package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Order.OrderResponse;
import com.manfashion.springboot_be.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    // MapStruct tự động map trường "id" của Order sang "id" của OrderResponse

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "coupon.id", target = "couponId")
    @Mapping(source = "coupon.code", target = "couponCode")
    OrderResponse toResponse(Order order);
}
