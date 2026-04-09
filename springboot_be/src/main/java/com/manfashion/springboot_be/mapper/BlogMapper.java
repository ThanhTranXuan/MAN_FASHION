package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Blog.BlogResponse;
import com.manfashion.springboot_be.entity.Blog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BlogMapper {
    // MapStruct sẽ tự động ép kiểu ID từ Integer/Long (của MySQL) sang String (của DTO)
    // Các trường còn lại (title, content, slug...) trùng tên nên hệ thống tự động map, không cần khai báo thêm!
    @Mapping(target = "id", source = "id")
    BlogResponse toResponseDTO(Blog blog);

}

