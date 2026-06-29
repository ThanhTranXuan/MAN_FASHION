package com.manfashion.springboot_be.controller.Coupon;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Coupon.CouponRequest;
import com.manfashion.springboot_be.DTO.Coupon.CouponResponse;
import com.manfashion.springboot_be.service.Coupon.CouponServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponServiceImpl couponService;


    @GetMapping
    public ApiResponse<Page<CouponResponse>> getAllCoupons(
            @RequestParam(required = false) String keyword,
            Pageable pageable) {

        Page<CouponResponse> coupons = couponService.getAllCoupons(keyword, pageable);

        return ApiResponse.<Page<CouponResponse>>builder()
                .message("coupon.get.success")
                .data(coupons)
                .build();
    }


    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<CouponResponse> createCoupon(@RequestBody CouponRequest request) {
        CouponResponse response = couponService.createCoupon(request);

        return ApiResponse.<CouponResponse>builder()
                .message("coupon.create.success")
                .data(response)
                .build();
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<CouponResponse> updateCoupon(
            @PathVariable String id,
            @RequestBody CouponRequest request) {

        CouponResponse response = couponService.updateCoupon(id, request);

        return ApiResponse.<CouponResponse>builder()
                .message("coupon.update.success")
                .data(response)
                .build();
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable String id) {
        couponService.softDeleteCoupon(id);


        return ResponseEntity.noContent().build();
    }
}