package com.manfashion.springboot_be.service.User;

import com.manfashion.springboot_be.DTO.User.*;

import java.util.Optional;


public interface UserService {
    UserResponse createUser(UserCreateRequest request);

    UserResponse getUserById(String userId);

    Optional<UserResponse> updateProfile(String userId, UserUpdateProfileRequest req);
    Optional<UserResponse> updateAvatar(String userIdHex, UserUpdateAvatarRequest req);

    void delete(String userIdHex);

    void changePassword(String userId, UserChangePasswordRequest req);
}

