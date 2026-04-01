package com.manfashion.springboot_be.service.User;

import com.manfashion.springboot_be.DTO.User.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;


public interface UserService {
    UserResponse createUser(UserCreateRequest request);

    UserResponse getUserById(String userId);

    Optional<UserResponse> updateProfile(String userId, UserUpdateProfileRequest req);
    Optional<UserResponse> updateAvatar(String userIdHex, UserUpdateAvatarRequest req);

    Page<UserResponse> getAllUsers(String keyword, String roleId, Pageable pageable);
    void delete(String userIdHex);

    void changePassword(String userId, UserChangePasswordRequest req);
}

