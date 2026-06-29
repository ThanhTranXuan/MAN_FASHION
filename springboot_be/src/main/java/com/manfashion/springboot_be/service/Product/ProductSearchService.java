package com.manfashion.springboot_be.service.Product;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.manfashion.springboot_be.DTO.Product.ProductResponse;
import com.manfashion.springboot_be.entity.Category;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductImage;
import com.manfashion.springboot_be.entity.ProductVariant;
import com.manfashion.springboot_be.repository.Category.CategoryRepository;
import com.manfashion.springboot_be.repository.Product.ProductImageRepository;
import com.manfashion.springboot_be.repository.Product.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductSearchService {

    private final ObjectMapper mapper = new ObjectMapper();

    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;

    private Category getCategoryById(Integer id) {
        if (id == null) return null;
        return categoryRepository.findById(id).orElse(null);
    }

    private List<ProductVariant> getVariantsByProductId(Integer productId) {
        return variantRepository.findByProductIdAndDeletedAtIsNull(productId);
    }

    private List<ProductImage> getImagesByProductId(Integer productId) {
        return imageRepository.findByProductIdAndDeletedAtIsNull(productId);
    }

    public List<Map<String, Object>> searchRelevantProducts(String keyword, int height, int weight, String categorySlug) {
        if (keyword == null || keyword.isBlank()) {
            return Collections.emptyList();
        }

        String suggestedSize = suggestSize(height, weight);
        List<String> sizes = suggestedSize != null ? List.of(suggestedSize) : null;

        List<ProductResponse> results;


        results = productService.searchForChatBot(keyword.trim(), null, categorySlug, null, sizes, 10);


        if (results.isEmpty()) {
            results = productService.searchForChatBot(keyword.trim(), null, categorySlug, null, null, 15);
        }


        if (results.isEmpty()) {
            results = productService.searchForChatBot(keyword.trim(), null, null, null, null, 20);
        }

        return results.stream()
                .limit(5)
                .map(resp -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", resp.getId());
                    map.put("name", resp.getName());
                    map.put("slug", resp.getSlug());
                    map.put("price", resp.getPrice());
                    map.put("categoryName", resp.getCategoryName() != null ? resp.getCategoryName() : "");
                    map.put("variants", resp.getVariants() != null ? resp.getVariants() : Collections.emptyList());
                    map.put("images", resp.getImages() != null ? resp.getImages() : Collections.emptyList());
                    return map;
                })
                .collect(Collectors.toList());
    }


    private Map<String, Object> convertProductToMap(Product p,
                                                    Category category,
                                                    List<ProductVariant> variants,
                                                    List<ProductImage> images) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId().toString());
        map.put("name", p.getName());
        map.put("slug", p.getSlug());
        map.put("price", p.getPrice());
        map.put("categoryName", category != null ? category.getName() : "");
        map.put("variants", variants != null ? variants : Collections.emptyList());
        map.put("images", images != null ? images : Collections.emptyList());
        return map;
    }

    private List<Map<String, Object>> convertToList(JsonNode arr) {
        return StreamSupport.stream(arr.spliterator(), false)
                .map(node -> mapper.convertValue(node, new TypeReference<Map<String, Object>>() {}))
                .collect(Collectors.toList());
    }

    private String suggestSize(int height, int weight) {
        double bmi = weight / Math.pow(height / 100.0, 2);
        if (bmi >= 27.5) return "2XL";
        if (bmi >= 25) return "XL";
        if (bmi >= 23) return "L";
        return "M";
    }
}
