package com.manfashion.springboot_be.DTO.Review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequest {
    private Integer rating;
    private String title;
    private String comment;
    private String purchasedSize;
    private String purchasedColor;
    private String nickname;
    private String gender;
    private String location;
}
