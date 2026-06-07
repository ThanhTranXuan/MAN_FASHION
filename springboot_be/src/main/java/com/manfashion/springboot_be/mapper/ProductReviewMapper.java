package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Review.ReviewResponse;
import com.manfashion.springboot_be.entity.ProductReview;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductReviewMapper {

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.slug", target = "productSlug")
    @Mapping(source = "user.fullName", target = "userFullName")
    @Mapping(source = "user.avatarUrl", target = "userAvatarUrl")
    ReviewResponse toResponse(ProductReview review);

    @AfterMapping
    default void completeDerivedFields(ProductReview review, @MappingTarget ReviewResponse response) {
        if (review.getUser() == null) {
            response.setUserFullName(review.getNickname());
        }
        response.setVerifiedPurchase(Boolean.TRUE.equals(review.getVerifiedPurchase()));
    }
}
