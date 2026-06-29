package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Product.ProductImageResponse;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductImage;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.ProductMapper;
import com.manfashion.springboot_be.repository.Product.ProductImageRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.util.UploadImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository imageRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final UploadImage uploadImage;

    @Override
    public List<ProductImageResponse> uploadImages(
            String productId,
            String color,
            List<MultipartFile> files,
            List<String> remainingImageUrls) {

        Integer parsedProductId = Integer.parseInt(productId);
        Product product = productRepository.findById(parsedProductId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        List<ProductImage> oldImages = findCurrentImages(parsedProductId, color);

        if (remainingImageUrls != null) {
            deleteImagesNotIn(oldImages, remainingImageUrls);

            if (files == null || files.isEmpty()) {
                return findCurrentImages(parsedProductId, color)
                        .stream().map(productMapper::toImageResponseDTO).toList();
            }

            return saveUploadedImages(product, color, files);
        }

        deleteImages(oldImages);

        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }

        return saveUploadedImages(product, color, files);
    }

    private List<ProductImage> findCurrentImages(Integer productId, String color) {
        if (color != null && !color.isBlank()) {
            return imageRepository.findByProductIdAndColorIgnoreCaseAndDeletedAtIsNull(productId, color);
        }

        return imageRepository.findByProductIdAndColorIsNullAndDeletedAtIsNull(productId);
    }

    private void deleteImagesNotIn(List<ProductImage> images, List<String> remainingImageUrls) {
        Set<String> remainingUrls = new HashSet<>(remainingImageUrls);
        List<ProductImage> removedImages = images.stream()
                .filter(image -> !remainingUrls.contains(image.getUrl()))
                .toList();

        deleteImages(removedImages);
    }

    private void deleteImages(List<ProductImage> images) {
        for (ProductImage image : images) {
            try {
                uploadImage.deleteImage(image.getUrl());
            } catch (Exception ignored) {

            }
        }

        if (!images.isEmpty()) {
            imageRepository.deleteAll(images);
        }
    }

    private List<ProductImageResponse> saveUploadedImages(Product product, String color, List<MultipartFile> files) {
        List<ProductImage> newImages = new ArrayList<>();
        boolean isProductImage = color == null || color.isBlank();

        for (int i = 0; i < files.size(); i++) {
            String url;
            try {
                url = uploadImage.uploadImage(files.get(i));
            } catch (IOException e) {
                throw new RuntimeException("Lỗi trong quá trình upload ảnh lên Cloud: " + e.getMessage());
            }

            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setUrl(url);
            image.setColor(isProductImage ? null : color.toLowerCase());
            image.setIsThumbnail(isProductImage && i == 0);

            newImages.add(image);
        }

        return imageRepository.saveAll(newImages)
                .stream().map(productMapper::toImageResponseDTO).toList();
    }
}
