package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Product.ProductVariantRequest;
import com.manfashion.springboot_be.DTO.Product.ProductVariantResponse;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductVariant;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.ProductMapper;
import com.manfashion.springboot_be.repository.Product.ProductImageRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Product.ProductVariantRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService{
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public ProductVariantResponse addVariant(String productId, ProductVariantRequest req) {
        Product product = productRepository.findById(Integer.parseInt(productId))
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductVariant variant = productMapper.toVariantEntity(req);
        variant.setProduct(product);

        return productMapper.toVariantResponseDTO(variantRepository.save(variant));
    }

    @Override
    @Transactional
    public ProductVariantResponse updateVariant(String variantId, ProductVariantRequest req) {
        ProductVariant variant = variantRepository.findById(Integer.parseInt(variantId))
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        productMapper.updateVariantFromRequest(req, variant);
        return productMapper.toVariantResponseDTO(variantRepository.save(variant));
    }

    @Override
    @Transactional
    public void deleteVariant(String variantId) {
        ProductVariant variant = variantRepository.findById(Integer.parseInt(variantId))
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        variant.setDeletedAt(LocalDateTime.now());
        variantRepository.save(variant);

        String color = variant.getColor();
        Integer productId = variant.getProduct() != null ? variant.getProduct().getId() : null;
        if (productId == null || color == null || color.isBlank()) {
            return;
        }

        boolean hasActiveVariantWithSameColor =
                variantRepository.existsByProductIdAndColorIgnoreCaseAndDeletedAtIsNull(productId, color);
        if (hasActiveVariantWithSameColor) {
            return;
        }

        imageRepository.findByProductIdAndColorIgnoreCaseAndDeletedAtIsNull(productId, color)
                .forEach(image -> {
                    image.setDeletedAt(LocalDateTime.now());
                    imageRepository.save(image);
                });
    }
}
