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
    // ➕ Tạo category
    CategoryResponse createCategory(CategoryRequest req);

    CategoryResponse createCategory(CategoryRequest req, MultipartFile file) throws IOException;

    // ✏️ Cập nhật category
    Optional<CategoryResponse> updateCategory(String idHex, CategoryRequest req);

    Optional<CategoryResponse> updateCategory(String idHex, CategoryRequest req, MultipartFile file) throws IOException;

    // 📃 Lấy tất cả category
    Page<CategoryResponse> getAllCategories(Pageable pageable);

    // 🔍 Lấy theo slug
    CategoryResponse getBySlug(String slug);

    // 🗑️ Xóa mềm (kéo theo xóa cả danh mục con)
    boolean softDeleteCategory(String idHex);
}
