package com.manfashion.springboot_be.service.Blog;

import com.manfashion.springboot_be.DTO.Blog.BlogRequest;
import com.manfashion.springboot_be.DTO.Blog.BlogResponse;
import com.manfashion.springboot_be.entity.Blog;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.BlogMapper;
import com.manfashion.springboot_be.repository.Blog.BlogRepository;
import com.manfashion.springboot_be.util.SlugGenerator;
import com.manfashion.springboot_be.util.UploadImage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final UploadImage uploadImage;
    private final SlugGenerator slugGenerator;
    private final BlogMapper blogMapper; // Inject Mapper xịn xò vào đây

    // =====================================================
    // 🧱 Helper: Sinh Slug duy nhất
    // =====================================================
    private String generateUniqueSlug(String title) {
        String base = slugGenerator.toSlug(title);
        String slug = base;
        int count = 1;
        while (blogRepository.existsBySlug(slug)) {
            slug = base + "-" + count++;
        }
        return slug;
    }

    // =====================================================
    // ➕ Create
    // =====================================================
    @Override
    public BlogResponse createBlog(BlogRequest req, MultipartFile file) throws IOException {
        String thumbnailUrl = req.getThumbnail();

        if (file != null && !file.isEmpty()) {
            thumbnailUrl = uploadImage.uploadImage(file);
        }

        Blog blog = Blog.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .thumbnail(thumbnailUrl)
                .slug(generateUniqueSlug(req.getTitle()))
                .createdAt(LocalDateTime.now())
                .build();

        return blogMapper.toResponseDTO(blogRepository.save(blog));
    }

    // =====================================================
    // ✏️ Update
    // =====================================================
    @Override
    public BlogResponse updateBlog(String idStr, BlogRequest req, MultipartFile file) throws IOException {
        Integer id = Integer.valueOf(idStr); // Ép kiểu cho MySQL

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND));

        String oldTitle = blog.getTitle();
        blog.setTitle(req.getTitle());
        blog.setContent(req.getContent());

        // Ưu tiên file upload mới, nếu không có thì lấy chuỗi URL gửi lên
        if (file != null && !file.isEmpty()) {
            blog.setThumbnail(uploadImage.uploadImage(file));
        } else if (req.getThumbnail() != null && !req.getThumbnail().isBlank()) {
            blog.setThumbnail(req.getThumbnail());
        }

        // Nếu người dùng đổi Title -> Sinh lại Slug mới
        if (!Objects.equals(oldTitle, blog.getTitle())) {
            blog.setSlug(generateUniqueSlug(blog.getTitle()));
        }

        blog.setUpdatedAt(LocalDateTime.now());

        return blogMapper.toResponseDTO(blogRepository.save(blog));
    }

    // =====================================================
    // ❌ Hard Delete
    // =====================================================
    @Override
    public void deleteBlog(String idStr) {
        Integer id = Integer.valueOf(idStr);
        if (!blogRepository.existsById(id)) {
            throw new AppException(ErrorCode.BLOG_NOT_FOUND);
        }
        blogRepository.deleteById(id);
    }

    // =====================================================
    // 📃 Get All (sort DESC)
    // =====================================================
    @Override
    public Page<BlogResponse> getAllBlogs(String keyword, Pageable pageable) {
        Page<Blog> page = (keyword != null && !keyword.isBlank())
                ? blogRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(keyword, pageable)
                : blogRepository.findAllByOrderByCreatedAtDesc(pageable);

        // Map nguyên cái Page Entity sang Page DTO cực mượt
        return page.map(blogMapper::toResponseDTO);
    }

    // =====================================================
    // 🔍 Get by ID
    // =====================================================
    @Override
    public BlogResponse getBlogById(String idStr) {
        Integer id = Integer.valueOf(idStr);
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND));
        return blogMapper.toResponseDTO(blog);
    }

    // =====================================================
    // 🔍 Get by Slug
    // =====================================================
    @Override
    public BlogResponse getBySlug(String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND));
        return blogMapper.toResponseDTO(blog);
    }
}
