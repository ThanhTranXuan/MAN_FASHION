package com.manfashion.springboot_be.DTO.Category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {
    private String id;
    private String name;
    private String slug;
    private String parentId;
    private String parentSlug;
}

