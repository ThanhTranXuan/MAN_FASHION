package com.manfashion.springboot_be.DTO.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateAvatarRequest {
    private String avatarUrl;
}

