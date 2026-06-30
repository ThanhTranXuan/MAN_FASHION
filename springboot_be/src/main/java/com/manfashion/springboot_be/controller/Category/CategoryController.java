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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;


    @GetMapping
    public ResponseEntity<Page<CategoryResponse>> getCategories(Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAllCategories(pageable));
    }


    @GetMapping("/{slug}")
    public ApiResponse<CategoryResponse> getCategoryBySlug(@PathVariable String slug) {
        CategoryResponse categoryResponse = categoryService.getBySlug(slug);

        return ApiResponse.<CategoryResponse>builder()
                .message("category.get.success")
                .data(categoryResponse)
                .build();
    }


    @PostMapping(consumes = "application/json")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<CategoryResponse> createCategory(@RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);

        return ApiResponse.<CategoryResponse>builder()
                .message("category.create.success")
                .data(response)
                .build();
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<CategoryResponse> createCategoryWithThumbnail(
            @RequestPart("category") CategoryRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        CategoryResponse response = categoryService.createCategory(request, file);

        return ApiResponse.<CategoryResponse>builder()
                .message("category.create.success")
                .data(response)
                .build();
    }


    @PutMapping(value = "/{id}", consumes = "application/json")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable String id, @RequestBody CategoryRequest request) {
        CategoryResponse updatedCategory = categoryService.updateCategory(id, request)

                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        return ApiResponse.<CategoryResponse>builder()
                .message("category.update.success")
                .data(updatedCategory)
                .build();
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<CategoryResponse> updateCategoryWithThumbnail(
            @PathVariable String id,
            @RequestPart("category") CategoryRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        CategoryResponse updatedCategory = categoryService.updateCategory(id, request, file)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        return ApiResponse.<CategoryResponse>builder()
                .message("category.update.success")
                .data(updatedCategory)
                .build();
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        boolean deleted = categoryService.softDeleteCategory(id);
        if (!deleted) {
            throw new RuntimeException("Category not found or cannot be deleted");
        }
        return ResponseEntity.noContent().build();
    }
}
