package com.manfashion.springboot_be.service.Category;

import com.manfashion.springboot_be.DTO.Category.CategoryRequest;
import com.manfashion.springboot_be.DTO.Category.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest req);

    CategoryResponse createCategory(CategoryRequest req, MultipartFile file) throws IOException;


    Optional<CategoryResponse> updateCategory(String idHex, CategoryRequest req);

    Optional<CategoryResponse> updateCategory(String idHex, CategoryRequest req, MultipartFile file) throws IOException;


    Page<CategoryResponse> getAllCategories(Pageable pageable);


    CategoryResponse getBySlug(String slug);


    boolean softDeleteCategory(String idHex);
}
