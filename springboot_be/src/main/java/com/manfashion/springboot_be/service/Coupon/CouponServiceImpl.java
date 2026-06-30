package com.manfashion.springboot_be.service.Coupon;

import com.manfashion.springboot_be.DTO.Coupon.CouponRequest;
import com.manfashion.springboot_be.DTO.Coupon.CouponResponse;
import com.manfashion.springboot_be.entity.Coupon;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.CouponMapper;
import com.manfashion.springboot_be.repository.Coupon.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;






    @Override
    public CouponResponse createCoupon(CouponRequest dto) {
        if (couponRepository.findByCode(dto.getCode()).isPresent()) {
            throw new AppException(ErrorCode.COUPON_ALREADY_EXISTS);
        }

        Coupon c = Coupon.builder()
                .code(dto.getCode().trim().toUpperCase())
                .discountValue(dto.getDiscountValue())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .usageLimit(dto.getUsageLimit() != null ? dto.getUsageLimit() : 1)
                .usedCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        return couponMapper.toResponseDTO(couponRepository.save(c));
    }




    @Override
    public CouponResponse updateCoupon(String idHex, CouponRequest dto) {
        Integer id = Integer.parseInt(idHex);
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        c.setDiscountValue(dto.getDiscountValue());
        c.setStartDate(dto.getStartDate());
        c.setEndDate(dto.getEndDate());
        c.setUsageLimit(dto.getUsageLimit());
        c.setUpdatedAt(LocalDateTime.now());

        return couponMapper.toResponseDTO(couponRepository.save(c));
    }




    @Override
    public Page<CouponResponse> getAllCoupons(String keyword, Pageable pageable) {
        Page<Coupon> page;

        String normalizedKeyword = keyword == null ? "" : keyword.trim();
        if (!normalizedKeyword.isBlank()) {
            page = couponRepository.findByCodeContainingIgnoreCaseAndDeletedAtIsNullOrderByCreatedAtDesc(normalizedKeyword, pageable);
        } else {
            page = couponRepository.findByDeletedAtIsNullOrderByCreatedAtDesc(pageable);
        }

        return page.map(couponMapper::toResponseDTO);
    }




    @Override
    public void softDeleteCoupon(String idHex) {
        Integer id = Integer.parseInt(idHex);
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
        c.setDeletedAt(LocalDateTime.now());
        couponRepository.save(c);
    }
}

