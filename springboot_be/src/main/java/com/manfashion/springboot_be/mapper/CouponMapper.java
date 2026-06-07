package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Coupon.CouponResponse;
import com.manfashion.springboot_be.entity.Coupon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface CouponMapper {

    // 1. MapStruct tự động chuyển Integer/Long sang String an toàn
    @Mapping(target = "id", source = "id")

    // 2. Uỷ quyền việc tính toán isActive cho hàm default bên dưới
    @Mapping(target = "isActive", expression = "java(calculateIsActive(coupon))")
    @Mapping(target = "points", ignore = true)
    CouponResponse toResponseDTO(Coupon coupon);

    // =====================================================
    // 🧱 Helper: Logic nghiệp vụ tính toán trạng thái Coupon
    // =====================================================
    default boolean calculateIsActive(Coupon c) {
        if (c == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();

        return (c.getStartDate() == null || now.isAfter(c.getStartDate())) &&
                (c.getEndDate() == null || now.isBefore(c.getEndDate())) &&
                (c.getDeletedAt() == null);
    }
}
