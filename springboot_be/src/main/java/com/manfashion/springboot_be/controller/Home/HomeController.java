package com.manfashion.springboot_be.controller.Home;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Home.HomeOutfitSectionResponse;
import com.manfashion.springboot_be.service.Home.HomeOutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {
    private final HomeOutfitService homeOutfitService;

    @GetMapping("/outfits/daily")
    public ApiResponse<HomeOutfitSectionResponse> getDailyOutfit() {
        return ApiResponse.<HomeOutfitSectionResponse>builder()
                .message("home.outfit.daily.success")
                .data(homeOutfitService.getDailySection())
                .build();
    }

    @GetMapping("/outfits/relax")
    public ApiResponse<HomeOutfitSectionResponse> getRelaxOutfit() {
        return ApiResponse.<HomeOutfitSectionResponse>builder()
                .message("home.outfit.relax.success")
                .data(homeOutfitService.getRelaxSection())
                .build();
    }

    @GetMapping("/outfits/after-work")
    public ApiResponse<HomeOutfitSectionResponse> getAfterWorkOutfit() {
        return ApiResponse.<HomeOutfitSectionResponse>builder()
                .message("home.outfit.after_work.success")
                .data(homeOutfitService.getAfterWorkSection())
                .build();
    }
}
