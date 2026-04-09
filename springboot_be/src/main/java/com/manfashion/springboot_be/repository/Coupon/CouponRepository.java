package com.manfashion.springboot_be.repository.Coupon;

import com.manfashion.springboot_be.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon,Integer> {
    Optional<Coupon> findByCode(String code);

    Page<Coupon> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable);

    Page<Coupon> findByCodeContainingIgnoreCaseAndDeletedAtIsNullOrderByCreatedAtDesc(String keyword, Pageable pageable);
}
