package com.manfashion.springboot_be.DTO.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateRequest {
    @NotBlank(message = "FULLNAME_REQUIRED")
    private String fullName ;

    @Email(message = "EMAIL_INVALID")
    @NotBlank(message = "EMAIL_REQUIRED")
    private String email;

    @NotBlank(message = "PASSWORD_REQUIRED")
    @Size(min = 6,message = "PASSWORD_TOO_SHORT")
    private String password;
}
