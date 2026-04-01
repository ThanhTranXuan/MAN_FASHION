package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Product.ProductVariantRequest;
import com.manfashion.springboot_be.DTO.Product.ProductVariantResponse;

public interface ProductVariantService {
    ProductVariantResponse addVariant(String productId, ProductVariantRequest req);
    ProductVariantResponse updateVariant(String variantId, ProductVariantRequest req);
    void deleteVariant(String variantId);
}
