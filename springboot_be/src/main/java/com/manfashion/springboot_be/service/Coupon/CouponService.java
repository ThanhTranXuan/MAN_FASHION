package com.manfashion.springboot_be.service.Coupon;

import com.manfashion.springboot_be.DTO.Coupon.CouponRequest;
import com.manfashion.springboot_be.DTO.Coupon.CouponResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CouponService {

    Page<CouponResponse> getAllCoupons(String keyword, Pageable pageable);


    CouponResponse createCoupon(CouponRequest request);


    CouponResponse updateCoupon(String id, CouponRequest request);


    void softDeleteCoupon(String id);
}
