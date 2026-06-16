package com.manfashion.springboot_be.DTO.Home;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HomeOutfitSectionResponse {
    private String sectionKey;
    private String title;
    private String description;
    private String productQuery;
    private List<HomeProductResponse> products;
}
