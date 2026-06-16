package com.manfashion.springboot_be.service.Home;

import com.manfashion.springboot_be.DTO.Home.HomeOutfitSectionResponse;
import com.manfashion.springboot_be.DTO.Home.HomeProductResponse;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductImage;
import com.manfashion.springboot_be.entity.ProductVariant;
import com.manfashion.springboot_be.entity.ReviewStatus;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Product.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HomeOutfitService {
    private static final int PRODUCT_POOL_SIZE = 200;
    private static final int SECTION_LIMIT = 6;

    private final ProductRepository productRepository;
    private final ProductReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public HomeOutfitSectionResponse getDailySection() {
        return buildSection(
                "daily",
                "Di lam gon gang",
                "So mi sang mau, quan dung phom va sneaker toi gian cho lich trinh ban ron.",
                "so mi polo quan dai quan tay linen sneaker trang be xam navy",
                List.of("so mi", "polo", "quan dai", "quan tay", "linen", "sneaker", "trang", "white", "be", "beige", "gray", "navy"),
                product -> !containsAny(productText(product), "do lot", "underwear")
        );
    }

    @Transactional(readOnly = true)
    public HomeOutfitSectionResponse getRelaxSection() {
        return buildSection(
                "relax",
                "Cuoi tuan thoai mai",
                "Chat lieu thoang, mau trung tinh va phom rong vua du de di chuyen ca ngay.",
                "ao thun short quan short rong cotton airism be xam trang navy",
                List.of("ao thun", "thun", "ao phong", "short", "quan short", "rong", "cotton", "airism", "be", "beige", "gray", "white", "navy"),
                product -> !containsAny(productText(product), "do lot", "underwear", "vest", "blazer")
        );
    }

    @Transactional(readOnly = true)
    public HomeOutfitSectionResponse getAfterWorkSection() {
        return buildSection(
                "after-work",
                "Diem nhan buoi toi",
                "Layer toi mau cung phu kien noi bat de tong the co chieu sau hon.",
                "ao khoac jacket so mi quan phu kien tui mu black navy gray sneaker",
                List.of("ao khoac", "jacket", "so mi", "quan", "phu kien", "tui", "mu", "non", "black", "den", "navy", "gray", "sneaker"),
                product -> !containsAny(productText(product), "do lot", "underwear")
        );
    }

    private HomeOutfitSectionResponse buildSection(
            String sectionKey,
            String title,
            String description,
            String productQuery,
            List<String> keywords,
            Predicate<Product> guard) {
        List<Product> pool = productRepository.findActiveBotCandidates(PageRequest.of(0, PRODUCT_POOL_SIZE));
        List<Product> selected = pool.stream()
                .filter(guard)
                .map(product -> new ProductScore(product, scoreProduct(product, keywords)))
                .filter(scored -> scored.score() > 0)
                .sorted(Comparator.comparingInt(ProductScore::score).reversed())
                .map(ProductScore::product)
                .limit(SECTION_LIMIT)
                .toList();

        Map<Integer, ProductReviewRepository.ProductRatingSummary> ratings = selected.isEmpty()
                ? Map.of()
                : reviewRepository.getRatingSummariesByProductIds(
                        selected.stream().map(Product::getId).toList(),
                        ReviewStatus.APPROVED
                ).stream().collect(Collectors.toMap(
                        ProductReviewRepository.ProductRatingSummary::getProductId,
                        summary -> summary
                ));

        return HomeOutfitSectionResponse.builder()
                .sectionKey(sectionKey)
                .title(title)
                .description(description)
                .productQuery(productQuery)
                .products(selected.stream().map(product -> toResponse(product, ratings)).toList())
                .build();
    }

    private int scoreProduct(Product product, List<String> keywords) {
        String value = productText(product);
        int score = 0;
        for (String keyword : keywords) {
            if (containsWhole(value, keyword)) score += 8;
            else if (value.contains(normalize(keyword))) score += 3;
        }
        if (hasStock(product)) score += 3;
        if (hasImage(product)) score += 3;
        return score;
    }

    private HomeProductResponse toResponse(Product product, Map<Integer, ProductReviewRepository.ProductRatingSummary> ratings) {
        List<ProductVariant> activeVariants = product.getVariants().stream()
                .filter(v -> v.getDeletedAt() == null && v.getStock() != null && v.getStock() > 0)
                .toList();
        ProductImage image = product.getImages().stream()
                .filter(i -> i.getDeletedAt() == null && i.getUrl() != null && !i.getUrl().isBlank())
                .sorted(Comparator.comparing(i -> !Boolean.TRUE.equals(i.getIsThumbnail())))
                .findFirst()
                .orElse(null);
        Set<String> colors = activeVariants.stream()
                .map(ProductVariant::getColor)
                .filter(v -> v != null && !v.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        Set<String> sizes = activeVariants.stream()
                .map(ProductVariant::getSize)
                .filter(v -> v != null && !v.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        var rating = ratings.get(product.getId());

        return HomeProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .price(product.getPrice())
                .thumbnail(image == null ? null : image.getUrl())
                .categoryName(product.getCategory() == null ? null : product.getCategory().getName())
                .colors(new ArrayList<>(colors))
                .sizes(new ArrayList<>(sizes))
                .averageRating(rating == null ? 0.0 : rating.getAverageRating())
                .reviewCount(rating == null ? 0L : rating.getReviewCount())
                .build();
    }

    private boolean hasStock(Product product) {
        return product.getVariants().stream().anyMatch(v -> v.getDeletedAt() == null && v.getStock() != null && v.getStock() > 0);
    }

    private boolean hasImage(Product product) {
        return product.getImages().stream().anyMatch(i -> i.getDeletedAt() == null && i.getUrl() != null && !i.getUrl().isBlank());
    }

    private String productText(Product product) {
        return normalize(String.join(" ",
                value(product.getName()),
                value(product.getDescription()),
                product.getCategory() == null ? "" : value(product.getCategory().getName()),
                product.getCategory() == null ? "" : value(product.getCategory().getSlug()),
                product.getVariants().stream().map(ProductVariant::getColor).filter(v -> v != null).collect(Collectors.joining(" ")),
                product.getVariants().stream().map(ProductVariant::getSize).filter(v -> v != null).collect(Collectors.joining(" "))
        ));
    }

    private boolean containsAny(String value, String... needles) {
        for (String needle : needles) {
            if (value.contains(normalize(needle))) return true;
        }
        return false;
    }

    private boolean containsWhole(String value, String needle) {
        return (" " + normalize(value) + " ").contains(" " + normalize(needle) + " ");
    }

    private String normalize(String value) {
        String lower = value(value).toLowerCase(Locale.ROOT);
        return Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String value(String value) {
        return value == null ? "" : value;
    }

    private record ProductScore(Product product, int score) {
    }
}
