package com.manfashion.springboot_be.controller.Product;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Product.*;
import com.manfashion.springboot_be.service.Product.ProductImageService;
import com.manfashion.springboot_be.service.Product.ProductService;
import com.manfashion.springboot_be.service.Product.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController

@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final ProductImageService productImageService;
    private final ProductVariantService productVariantService;

    // get statistic
    @GetMapping("/stats")
    public ApiResponse<List<ProductStatsResponse>>getStatsByCategory(){
        List<ProductStatsResponse> stats = productService.getStatsByCategory();
        return ApiResponse.<List<ProductStatsResponse>>builder()
                .message("product.stats.fetch.success")
                .data(stats)
                .build();
    }
    // 🛍️ GET all products (public)
    @GetMapping
    public ApiResponse<Page<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) List<String> sizes,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            Pageable pageable) {

        Page<ProductResponse> page = productService.getAllProducts(keyword, categorySlug, color, sizes, inStock, active, sort, pageable);

        return ApiResponse.<Page<ProductResponse>>builder()
                .message("product.get_all.success")
                .data(page)
                .build();
    }

    // 🔍 GET product by slug (public)
    @GetMapping("/detail/{slug}")
    public ApiResponse<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.<ProductResponse>builder()
                .message("product.get_detail.success")
                .data(productService.getBySlug(slug))
                .build();
    }

    // 🔎 GET product by internal ID (ADMIN/EMPLOYEE only)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE','USER')")
    public ApiResponse<ProductResponse> getProductById(@PathVariable String id) {
        return ApiResponse.<ProductResponse>builder()
                .message("product.get_by_id.success")
                .data(productService.getById(id))
                .build();
    }

    // 🤖 GET products for chatbot
    @GetMapping("/search-for-chat")
    public ApiResponse<List<ProductResponse>> searchProductsForChat(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) List<String> sizes,
            @RequestParam(defaultValue = "5") int limit) {

        List<ProductResponse> results = productService.searchForChatBot(keyword, gender, categorySlug, color, sizes, limit);

        return ApiResponse.<List<ProductResponse>>builder()
                .message("product.search_chat.success")
                .data(results)
                .build();
    }

    // 🔗 GET similar products
    @GetMapping("/{id}/similar")
    public ApiResponse<List<ProductResponse>> getSimilarProducts(
            @PathVariable String id,
            @RequestParam(defaultValue = "8") int limit) {
        
        List<ProductResponse> results = productService.getSimilarProducts(id, limit);
        return ApiResponse.<List<ProductResponse>>builder()
                .message("product.similar.success")
                .data(results)
                .build();
    }

    // ➕ CREATE new product (ADMIN/EMPLOYEE only)
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    @ResponseStatus(HttpStatus.CREATED) // Đảm bảo trả về HTTP Status 201
    public ApiResponse<ProductResponse> createProduct(@RequestBody ProductRequest req) {
        ProductResponse createdProduct = productService.create(req);

        return ApiResponse.<ProductResponse>builder()
                .message("product.create.success")
                .data(createdProduct)
                .build();
    }

    // ♻️ UPDATE product (ADMIN/EMPLOYEE only)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable String id, @RequestBody ProductRequest req) {
        return ApiResponse.<ProductResponse>builder()
                .message("product.update.success")
                .data(productService.update(id, req))
                .build();
    }

    // ✅ TOGGLE product active status (ADMIN only)
    @PatchMapping("/{id}/active")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<ProductResponse> patchActiveStatus(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        Boolean isActive = body.get("isActive");

        return ApiResponse.<ProductResponse>builder()
                .message("product.toggle_active.success")
                .data(productService.patchActiveStatus(id, isActive))
                .build();
    }

    // 🗑️ DELETE product (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable String id) {
        productService.softDelete(id);

        return ApiResponse.<Void>builder()
                .message("product.delete.success")
                // Không cần truyền .data() vì kiểu trả về là Void
                .build();
    }

    // 📦 UPLOAD product images (ADMIN/EMPLOYEE only)
    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<List<ProductImageResponse>> uploadImages(
            @PathVariable String id,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) List<String> remainingImageUrls,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) throws IOException {

        return ApiResponse.<List<ProductImageResponse>>builder()
                .message("product.upload_images.success")
                .data(productImageService.uploadImages(id, color, files, remainingImageUrls))
                .build();
    }

    // 🎨 ADD a new product variant (ADMIN/EMPLOYEE only)
    @PostMapping("/{id}/variants")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProductVariantResponse> addVariant(@PathVariable String id, @RequestBody ProductVariantRequest req) {
        ProductVariantResponse variant = productVariantService.addVariant(id, req);

        return ApiResponse.<ProductVariantResponse>builder()
                .message("product.variant.add.success")
                .data(variant)
                .build();
    }

    // 📝 UPDATE a product variant (ADMIN/EMPLOYEE only)
    @PutMapping("/variants/{variantId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<ProductVariantResponse> updateVariant(@PathVariable String variantId, @RequestBody ProductVariantRequest req) {
        return ApiResponse.<ProductVariantResponse>builder()
                .message("product.variant.update.success")
                .data(productVariantService.updateVariant(variantId, req))
                .build();
    }

    // 🗑️ DELETE a product variant (ADMIN only)
    @DeleteMapping("/variants/{variantId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<Void> deleteVariant(@PathVariable String variantId) {
        productVariantService.deleteVariant(variantId);

        return ApiResponse.<Void>builder()
                .message("product.variant.delete.success")
                .build();
    }
}
