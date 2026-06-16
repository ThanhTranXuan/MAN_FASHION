package com.manfashion.springboot_be.DTO.Home;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HomeProductResponse {
    private Integer id;
    private String name;
    private String slug;
    private Double price;
    private String thumbnail;
    private String categoryName;
    private List<String> colors;
    private List<String> sizes;
    private Double averageRating;
    private Long reviewCount;
}
