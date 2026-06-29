package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Product.*;
import com.manfashion.springboot_be.entity.Category;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductImage;
import com.manfashion.springboot_be.entity.ReviewStatus;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.ProductMapper;
import com.manfashion.springboot_be.repository.Category.CategoryRepository;
import com.manfashion.springboot_be.repository.Product.ProductImageRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Product.ProductReviewRepository;
import com.manfashion.springboot_be.repository.Product.ProductVariantRepository;
import com.manfashion.springboot_be.util.SlugGenerator;
import com.manfashion.springboot_be.util.UploadImage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService{
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final ProductReviewRepository reviewRepository;
    private final ProductMapper productMapper;
    private final SlugGenerator slugGenerator;
    private final UploadImage uploadImage;


    private ProductResponse toResponseWithRating(Product product) {
        return addRatings(List.of(product)).get(0);
    }

    private List<ProductResponse> addRatings(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return Collections.emptyList();
        }

        List<Integer> productIds = products.stream()
                .map(Product::getId)
                .toList();

        Map<Integer, ProductReviewRepository.ProductRatingSummary> ratingByProductId =
                reviewRepository.getRatingSummariesByProductIds(productIds, ReviewStatus.APPROVED)
                        .stream()
                        .collect(Collectors.toMap(
                                ProductReviewRepository.ProductRatingSummary::getProductId,
                                Function.identity()
                        ));

        return products.stream().map(product -> {
            ProductResponse response = productMapper.toResponseDTO(product);
            ProductReviewRepository.ProductRatingSummary rating = ratingByProductId.get(product.getId());
            response.setAverageRating(rating != null ? rating.getAverageRating() : null);
            response.setReviewCount(rating != null ? rating.getReviewCount() : 0L);
            return response;
        }).toList();
    }

    private String generateUniqueSlug(String name) {
        String base = slugGenerator.toSlug(name);
        String slug = base;
        int count = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = base + "-" + count++;
        }
        return slug;
    }



























    @Override
    public ProductResponse getBySlug(String slug) {
        Product p = productRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return toResponseWithRating(p);
    }

    @Override
    public ProductResponse getById(String id) {
        Product product = productRepository.findById(Integer.parseInt(id))
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return toResponseWithRating(product);
    }













    @Override
    @Transactional
    public ProductResponse create(ProductRequest req) {
        Product product = productMapper.toEntity(req);

        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(Integer.parseInt(req.getCategoryId()))
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        }

        product.setSlug(generateUniqueSlug(req.getName()));
        product.setIsActive(true);

        return productMapper.toResponseDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(String id, ProductRequest req) {
        Product product = productRepository.findById(Integer.parseInt(id))
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));


        if (!Objects.equals(product.getName(), req.getName())) {
            product.setSlug(generateUniqueSlug(req.getName()));
        }


        if (req.getCategoryId() != null &&
                (product.getCategory() == null || !req.getCategoryId().equals(product.getCategory().getId()))) {
            Category category = categoryRepository.findById(Integer.valueOf(req.getCategoryId()))
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        }

        productMapper.updateProductFromRequest(req, product);
        Product savedProduct = productRepository.save(product);
        if (req.getDeletedImageIds() != null && !req.getDeletedImageIds().isEmpty()) {
            deleteProductImages(savedProduct, req.getDeletedImageIds());
        } else if (req.getRemainingImageUrls() != null) {
            syncProductImages(savedProduct.getId(), req.getRemainingImageUrls());
        }

        return productMapper.toResponseDTO(savedProduct);
    }

    private void deleteProductImages(Product product, List<Integer> deletedImageIds) {
        List<Integer> distinctIds = deletedImageIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (distinctIds.isEmpty()) return;

        List<ProductImage> removedImages =
                imageRepository.findByIdInAndProductIdAndDeletedAtIsNull(distinctIds, product.getId());
        if (removedImages.isEmpty()) return;

        removedImages.forEach(image -> uploadImage.deleteImage(image.getUrl()));
        imageRepository.deleteAll(removedImages);
        product.getImages().removeIf(image ->
                removedImages.stream().anyMatch(removed -> removed.getId().equals(image.getId())));
    }

    private void syncProductImages(Integer productId, List<String> remainingImageUrls) {
        Set<String> remainingUrls = new HashSet<>(remainingImageUrls);

        List<ProductImage> removedImages =
                imageRepository.findByProductIdAndDeletedAtIsNull(productId)
                .stream()
                .filter(image -> !remainingUrls.contains(image.getUrl()))
                .toList();

        removedImages.forEach(image -> uploadImage.deleteImage(image.getUrl()));
        imageRepository.deleteAll(removedImages);
    }

    @Override
    public ProductResponse patchActiveStatus(String id, Boolean isActive) {
        Product p = productRepository.findById(Integer.parseInt(id))
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        p.setIsActive(isActive);
        return productMapper.toResponseDTO(productRepository.save(p));
    }

    @Override
    public void softDelete(String id) {
        Integer idStr = Integer.parseInt(id);
        Product p = productRepository.findById(idStr).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        p.setIsActive(false);
        p.setDeletedAt(LocalDateTime.now());
        productRepository.save(p);

        variantRepository.findByProductIdAndDeletedAtIsNull(p.getId()).forEach(v -> {
            v.setDeletedAt(LocalDateTime.now());
            variantRepository.save(v);
        });

        imageRepository.findByProductIdAndDeletedAtIsNull(p.getId()).forEach(i -> {
            i.setDeletedAt(LocalDateTime.now());
            imageRepository.save(i);
        });
    }





    private List<Integer> getCategoryAndChildrenIds(String slug) {
        List<Integer> ids = new ArrayList<>();

        categoryRepository.findBySlugAndDeletedAtIsNull(slug).ifPresent(category -> {
            collectIdsRecursive(category.getId(), ids);
        });
        return ids;
    }

    private void collectIdsRecursive(Integer parentId, List<Integer> ids) {
        ids.add(parentId);

        List<Category> children = categoryRepository.findByParentIdAndDeletedAtIsNull(parentId);
        for (Category child : children) {
            collectIdsRecursive(child.getId(), ids);
        }
    }




    @Override
    public List<ProductStatsResponse> getStatsByCategory() {

        List<Category> parents = categoryRepository.findByParentIdIsNullAndDeletedAtIsNull();

        return parents.stream().map(parent -> {

            List<Integer> allIds = this.getCategoryAndChildrenIds(parent.getSlug());


            long count = 0;
            if (!allIds.isEmpty()) {
                count = productRepository.countByCategoryIdInAndDeletedAtIsNull(allIds);
            }

            return ProductStatsResponse.builder()
                    .categoryId(String.valueOf(parent.getId()))
                    .name(parent.getName())
                    .description(String.valueOf(count))
                    .price(0.0)
                    .isActive(true)
                    .build();
        }).toList();
    }




    @Override
    public Page<ProductResponse> getAllProducts(String keyword, String categorySlug, String color, List<String> sizes, Boolean inStock, Boolean active, String sort, Pageable pageable) {
        List<Integer> categoryIds = null;

        if (categorySlug != null && !categorySlug.trim().isEmpty()) {

            categoryIds = this.getCategoryAndChildrenIds(categorySlug);


            if (categoryIds.isEmpty()) {
                return Page.empty(pageable);
            }
        }


        Page<Product> products = productRepository.searchAllProducts(keyword, categoryIds, color, sizes, inStock, active, sort, pageable);

        Map<String, ProductResponse> responsesById = addRatings(products.getContent()).stream()
                .collect(Collectors.toMap(ProductResponse::getId, Function.identity()));
        return products.map(product -> responsesById.getOrDefault(
                String.valueOf(product.getId()),
                productMapper.toResponseDTO(product)
        ));
    }




    @Override
    public List<ProductResponse> searchForChatBot(String keyword, String gender, String categorySlug, String color, List<String> sizes, int limit) {
        List<Integer> categoryIds = null;

        if (categorySlug != null && !categorySlug.trim().isEmpty()) {

            categoryIds = this.getCategoryAndChildrenIds(categorySlug);

            if (categoryIds.isEmpty()) {
                return Collections.emptyList();
            }
        }

        List<Product> products = productRepository.searchForChatBot(keyword, categoryIds, color, sizes, limit);
        return addRatings(products);
    }




    @Override
    public List<ProductResponse> getSimilarProducts(String id, int limit) {
        Product current = productRepository.findById(Integer.parseInt(id))
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (current.getCategory() == null) {
            return Collections.emptyList();
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit);
        List<Product> similar = productRepository.findSimilarProducts(
                current.getCategory().getId(), current.getId(), pageable);

        return addRatings(similar);
    }

    @Override
    public ProductFilterOptionsResponse getFilterOptions() {
        return ProductFilterOptionsResponse.builder()
                .colors(variantRepository.findAvailableColors())
                .sizes(variantRepository.findAvailableSizes())
                .build();
    }
}
