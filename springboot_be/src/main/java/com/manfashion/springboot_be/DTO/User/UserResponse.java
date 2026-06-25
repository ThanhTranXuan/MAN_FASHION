package com.manfashion.springboot_be.DTO.User;

import lombok.Builder;
import lombok.Data;
@Builder
@Data
public class UserResponse {
    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
    private String roleName;
    private String socialProvider;
}

