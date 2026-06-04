package com.manfashion.springboot_be.repository.Coupon;

import com.manfashion.springboot_be.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon,Integer> {
    Optional<Coupon> findByCode(String code);

    Page<Coupon> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable);

    Page<Coupon> findByCodeContainingIgnoreCaseAndDeletedAtIsNullOrderByCreatedAtDesc(String keyword, Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Coupon c
            SET c.usedCount = COALESCE(c.usedCount, 0) + 1
            WHERE c.id = :couponId
              AND c.deletedAt IS NULL
              AND (c.usageLimit IS NULL OR COALESCE(c.usedCount, 0) < c.usageLimit)
            """)
    int incrementUsedCountIfAvailable(@Param("couponId") Integer couponId);
}
