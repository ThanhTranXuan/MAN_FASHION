package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Product.ProductImageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {
    List<ProductImageResponse> uploadImages(String productId, String color, List<MultipartFile> files);
}
