package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Product.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
@Service
public interface ProductService {
    List<ProductStatsResponse> getStatsByCategory();
    Page<ProductResponse> getAllProducts(String keyword, String categorySlug, String color, List<String> sizes, Boolean inStock, Boolean active, String sortOption, Pageable pageable);
    ProductResponse getBySlug(String slug);
    ProductResponse getById(String idHex);
    ProductResponse create(ProductRequest req);
    ProductResponse update(String idHex, ProductRequest req);
    ProductResponse patchActiveStatus(String idHex, Boolean active);
    void softDelete(String idHex);
    List<ProductResponse> searchForChatBot(String keyword, String gender, String categorySlug, String color, List<String> sizes, int limit);


}
