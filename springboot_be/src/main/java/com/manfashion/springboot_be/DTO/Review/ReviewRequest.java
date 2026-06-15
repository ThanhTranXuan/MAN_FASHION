package com.manfashion.springboot_be.DTO.Review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequest {
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @NotBlank
    @Size(max = 100)
    private String title;

    @NotBlank
    private String comment;

    private String purchasedSize;
    private String purchasedColor;
    @NotNull
    private Integer orderItemId;
    private String nickname;
    private String gender;
    private String location;
}
