package com.manfashion.springboot_be.repository.Product;

import com.manfashion.springboot_be.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ProductRepositoryCustom {
    Page<Product> searchAllProducts(String keyword, List<Integer> categoryIds, String color, List<String> sizes, Boolean inStock, Boolean active, String sortOption, Pageable pageable);

    List<Product> searchForChatBot(String keyword, List<Integer> categoryIds, String color, List<String> sizes, int limit);
}