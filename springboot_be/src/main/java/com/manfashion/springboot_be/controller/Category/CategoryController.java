package com.manfashion.springboot_be.controller.Category;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Category.CategoryRequest;
import com.manfashion.springboot_be.DTO.Category.CategoryResponse;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.service.Category.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // 🗂️ GET all categories (public)
    @GetMapping
    public ResponseEntity<Page<CategoryResponse>> getCategories(Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAllCategories(pageable));
    }

    // 🔍 GET category by slug (public)
    @GetMapping("/{slug}")
    public ApiResponse<CategoryResponse> getCategoryBySlug(@PathVariable String slug) {
        CategoryResponse categoryResponse = categoryService.getBySlug(slug);

        return ApiResponse.<CategoryResponse>builder()
                .message("category.get.success")
                .data(categoryResponse)
                .build();
    }

    // ➕ CREATE new category (ADMIN/EMPLOYEE only)
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<CategoryResponse> createCategory(@RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);

        return ApiResponse.<CategoryResponse>builder()
                .message("category.create.success")
                .data(response)
                .build();
    }

    // ♻️ UPDATE category (ADMIN/EMPLOYEE only)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable String id, @RequestBody CategoryRequest request) {
        CategoryResponse updatedCategory = categoryService.updateCategory(id, request)
                // Nếu dự án có AppException thì dùng như UserController, nếu không bạn có thể đổi thành RuntimeException
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        return ApiResponse.<CategoryResponse>builder()
                .message("category.update.success")
                .data(updatedCategory)
                .build();
    }

    // 🗑️ DELETE (soft delete) category (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        boolean deleted = categoryService.softDeleteCategory(id);
        if (!deleted) {
            throw new RuntimeException("Category not found or cannot be deleted");
        }
        return ResponseEntity.noContent().build();
    }
}