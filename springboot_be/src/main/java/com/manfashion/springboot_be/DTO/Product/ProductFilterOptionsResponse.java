package com.manfashion.springboot_be.DTO.Product;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductFilterOptionsResponse {
    private List<String> colors;
    private List<String> sizes;
}
