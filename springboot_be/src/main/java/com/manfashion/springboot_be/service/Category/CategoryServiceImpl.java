package com.manfashion.springboot_be.service.Category;

import com.manfashion.springboot_be.DTO.Category.CategoryRequest;
import com.manfashion.springboot_be.DTO.Category.CategoryResponse;
import com.manfashion.springboot_be.entity.Category;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.CategoryMapper;
import com.manfashion.springboot_be.repository.Category.CategoryRepository;
import com.manfashion.springboot_be.util.SlugGenerator;
import com.manfashion.springboot_be.util.UploadImage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService{

    private final CategoryRepository categoryRepo;
    private final SlugGenerator slugGenerator;
    private final CategoryMapper categoryMapper;
    private final UploadImage uploadImage;


    // =====================================================
    // 🔗 Sinh slug duy nhất
    // =====================================================
    private String generateUniqueSlug(String input) {
        String baseSlug = slugGenerator.toSlug(input);
        String slug = baseSlug;
        int count = 1;
        while (categoryRepo.existsBySlug(slug)) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }

    // =====================================================
    // ➕ Tạo category
    // =====================================================
    @Override
    public CategoryResponse createCategory(CategoryRequest req) {
        try {
            return createCategory(req, null);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload category thumbnail", e);
        }
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest req, MultipartFile file) throws IOException {
        String slug = generateUniqueSlug(req.getName());
        Category parentCategory = null;
        String thumbnailUrl = req.getThumbnailUrl();

        if (file != null && !file.isEmpty()) {
            thumbnailUrl = uploadImage.uploadImage(file);
        }

        // Luồng chuẩn bị dữ liệu: Tìm đối tượng cha từ database nếu client truyền parentId
        if (StringUtils.hasText(req.getParentId())) {
            Integer parentId = Integer.parseInt(req.getParentId());
            parentCategory = categoryRepo.findById(parentId).orElse(null);
        }

        // Tạo đối tượng, chỉ cần móc cha vào là xong, JPA lo phần còn lại
        Category category = Category.builder()
                .name(req.getName())
                .slug(slug)
                .thumbnailUrl(thumbnailUrl)
                .parent(parentCategory)
                .build();

        return categoryMapper.toResponseDTO(categoryRepo.save(category));
    }

    // =====================================================
    // ✏️ Cập nhật category
    // =====================================================
    @Override
    public Optional<CategoryResponse> updateCategory(String idHex, CategoryRequest req) {
        try {
            return updateCategory(idHex, req, null);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload category thumbnail", e);
        }
    }

    @Override
    public Optional<CategoryResponse> updateCategory(String idHex, CategoryRequest req, MultipartFile file) throws IOException {
        Integer id = Integer.parseInt(idHex);

        return categoryRepo.findById(id).map(category -> {
            boolean nameChanged = false;

            if (StringUtils.hasText(req.getName()) && !req.getName().equalsIgnoreCase(category.getName())) {
                category.setName(req.getName());
                nameChanged = true;
            }

            if (nameChanged) {
                category.setSlug(generateUniqueSlug(req.getName()));
            }

            if (file != null && !file.isEmpty()) {
                try {
                    category.setThumbnailUrl(uploadImage.uploadImage(file));
                } catch (IOException e) {
                    throw new RuntimeException("Failed to upload category thumbnail", e);
                }
            } else if (req.getThumbnailUrl() != null) {
                category.setThumbnailUrl(req.getThumbnailUrl());
            }

            if (StringUtils.hasText(req.getParentId())) {
                Integer parentId = Integer.parseInt(req.getParentId());
                Category newParent = categoryRepo.findById(parentId).orElse(null);
                category.setParent(newParent);
            } else if (req.getParentId() != null && req.getParentId().isEmpty()) {
                category.setParent(null);
            }

            return categoryMapper.toResponseDTO(categoryRepo.save(category));
        });
    }

    // =====================================================
    // 📃 Lấy tất cả category
    // =====================================================
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        return categoryRepo.findByDeletedAtIsNull(pageable)
                .map(categoryMapper::toResponseDTO);
    }

    // =====================================================
    // 🗑️ Xóa mềm (cả con)
    // =====================================================
    public boolean softDeleteCategory(String idHex) {
        Integer id = Integer.parseInt(idHex);
        List<Integer> ids = new ArrayList<>();
        collectIdsRecursive(id, ids);

        if (ids.isEmpty()) return false;
        categoryRepo.softDeleteByIds(ids, LocalDateTime.now());

        return true;
    }

    private void collectIdsRecursive(Integer parentId, List<Integer> ids) {
        ids.add(parentId);
        List<Category> children = categoryRepo.findByParentId(parentId);
        for (Category child : children) {
            collectIdsRecursive(child.getId(), ids);
        }
    }

    // =====================================================
    // 🔍 Lấy theo slug
    // =====================================================
    public CategoryResponse getBySlug(String slug) {
        Category category = categoryRepo.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return categoryMapper.toResponseDTO(category);
    }
}

