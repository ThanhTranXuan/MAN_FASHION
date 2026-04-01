package com.manfashion.springboot_be.DTO.User;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateProfileRequest {
    private String fullName;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "PHONE_INVALID")
    private String phone;
    private String address;

}
