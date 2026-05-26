package com.manfashion.springboot_be.DTO.Authentication;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLoginRequest {
    @NotBlank(message = "FIELD_REQUIRED")
    private String idToken;

    private String provider;
}
