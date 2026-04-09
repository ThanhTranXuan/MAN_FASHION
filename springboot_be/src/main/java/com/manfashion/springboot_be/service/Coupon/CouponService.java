package com.manfashion.springboot_be.service.Coupon;

import com.manfashion.springboot_be.DTO.Coupon.CouponRequest;
import com.manfashion.springboot_be.DTO.Coupon.CouponResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CouponService {
    // Lấy danh sách mã giảm giá (có phân trang và tìm kiếm theo mã)
    Page<CouponResponse> getAllCoupons(String keyword, Pageable pageable);

    // Tạo mã giảm giá mới
    CouponResponse createCoupon(CouponRequest request);

    // Cập nhật mã giảm giá (Dựa theo ID)
    CouponResponse updateCoupon(String id, CouponRequest request);

    // Xóa mềm mã giảm giá (Soft Delete)
    void softDeleteCoupon(String id);
}
