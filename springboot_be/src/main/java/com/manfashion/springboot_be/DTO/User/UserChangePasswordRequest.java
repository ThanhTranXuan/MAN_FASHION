package com.manfashion.springboot_be.DTO.User;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserChangePasswordRequest {
    @NotBlank(message = "OlD_PASSWORD_REQUIRED")
    @Size(min = 6,message = "PASSWORD_TOO_SHORT")
    private String oldPassword;
    @NotBlank(message = "NEW_PASSWORD_REQUIRED")
    @Size(min = 6,message = "PASSWORD_TOO_SHORT")
    private String newPassword;
}
