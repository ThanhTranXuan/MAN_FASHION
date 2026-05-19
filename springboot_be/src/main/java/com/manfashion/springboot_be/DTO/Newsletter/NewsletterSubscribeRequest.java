package com.manfashion.springboot_be.DTO.Newsletter;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NewsletterSubscribeRequest {
    @NotBlank(message = "EMAIL_REQUIRED")
    @Email(message = "EMAIL_INVALID")
    private String email;
}
