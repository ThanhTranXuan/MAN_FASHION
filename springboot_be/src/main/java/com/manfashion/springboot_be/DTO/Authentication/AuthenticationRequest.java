package com.manfashion.springboot_be.DTO.Authentication;

import  jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationRequest {
    @Email(message = "EMAIL_INVALID")
    @NotBlank(message = "EMAIL_REQUIRED")
    String email;

    @NotBlank(message = "PASSWORD_REQUIRED")
    @Size(min = 6,message = "PASSWORD_TOO_SHORT")
    String password;
}
