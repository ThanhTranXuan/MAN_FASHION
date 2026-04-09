package com.manfashion.springboot_be.controller.Blog;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Blog.BlogRequest;
import com.manfashion.springboot_be.DTO.Blog.BlogResponse;
import com.manfashion.springboot_be.service.Blog.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    // 📖 GET all blogs (public)
    @GetMapping
    public ApiResponse<Page<BlogResponse>> getAllBlogs(
            @RequestParam(required = false) String keyword,
            Pageable pageable) {

        Page<BlogResponse> blogs = blogService.getAllBlogs(keyword, pageable);

        return ApiResponse.<Page<BlogResponse>>builder()
                .message("blog.get.success")
                .data(blogs)
                .build();
    }

    // 📰 GET blog by slug (public)
    @GetMapping("/{slug}")
    public ApiResponse<BlogResponse> getBlogBySlug(@PathVariable String slug) {
        BlogResponse blog = blogService.getBySlug(slug);

        return ApiResponse.<BlogResponse>builder()
                .message("blog.get.success")
                .data(blog)
                .build();
    }

    // ✏️ CREATE a new blog post (ADMIN/EMPLOYEE only)
    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<BlogResponse> createBlog(
            @RequestPart("blog") BlogRequest blogRequest,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {

        BlogResponse response = blogService.createBlog(blogRequest, file);

        return ApiResponse.<BlogResponse>builder()
                .message("blog.create.success")
                .data(response)
                .build();
    }

    // ♻️ UPDATE a blog post (ADMIN/EMPLOYEE only)
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<BlogResponse> updateBlog(
            @PathVariable String id,
            @RequestPart("blog") BlogRequest blogRequest,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {

        BlogResponse response = blogService.updateBlog(id, blogRequest, file);

        return ApiResponse.<BlogResponse>builder()
                .message("blog.update.success")
                .data(response)
                .build();
    }

    // 🗑️ DELETE a blog post (ADMIN/EMPLOYEE only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ResponseEntity<Void> deleteBlog(@PathVariable String id) {
        blogService.deleteBlog(id);

        // Trả về HTTP Status 204 (No Content) giống form chuẩn của hệ thống
        return ResponseEntity.noContent().build();
    }
}
