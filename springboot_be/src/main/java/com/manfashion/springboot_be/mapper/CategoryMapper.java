package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Category.CategoryResponse;
import com.manfashion.springboot_be.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "id", expression = "java(category.getId() != null ? String.valueOf(category.getId()) : null)")
    @Mapping(target = "thumbnailUrl", source = "thumbnailUrl")
    @Mapping(target = "parentId", expression = "java(category.getParent() != null ? String.valueOf(category.getParent().getId()) : null)")
    @Mapping(target = "parentSlug", expression = "java(category.getParent() != null ? category.getParent().getSlug() : null)")
    CategoryResponse toResponseDTO(Category category);

}
