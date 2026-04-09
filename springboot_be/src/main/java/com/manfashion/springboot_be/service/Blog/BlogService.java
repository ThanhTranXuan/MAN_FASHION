package com.manfashion.springboot_be.service.Blog;

import com.manfashion.springboot_be.DTO.Blog.BlogRequest;
import com.manfashion.springboot_be.DTO.Blog.BlogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface BlogService {
    // ➕ Create
    BlogResponse createBlog(BlogRequest req, MultipartFile file) throws IOException;

    // ✏️ Update
    BlogResponse updateBlog(String idStr, BlogRequest req, MultipartFile file) throws IOException;

    // ❌ Hard Delete
    void deleteBlog(String idStr);

    // 📃 Get All (sort DESC)
    Page<BlogResponse> getAllBlogs(String keyword, Pageable pageable);

    // 🔍 Get by ID
    BlogResponse getBlogById(String idStr);

    // 🔍 Get by Slug
    BlogResponse getBySlug(String slug);
}
