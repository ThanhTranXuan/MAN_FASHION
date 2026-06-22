package com.manfashion.springboot_be.controller.User;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.User.UserChangePasswordRequest;
import com.manfashion.springboot_be.DTO.User.UserResponse;
import com.manfashion.springboot_be.DTO.User.UserUpdateAvatarRequest;
import com.manfashion.springboot_be.DTO.User.UserUpdateProfileRequest;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.service.User.UserService;
import com.manfashion.springboot_be.util.UploadImage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UploadImage uploadImage;

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('USER','EMPLOYEE','ADMIN')")
    public ApiResponse<UserResponse> getProfile() {
        String userIdStr  = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        UserResponse userResponse = userService.getUserById(userIdStr);

        return ApiResponse.<UserResponse>builder()
                .message("user.get.success")
                .data(userResponse)
                .build();
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyAuthority('USER','EMPLOYEE','ADMIN')")
    public ApiResponse<UserResponse> updateProfile(@RequestBody UserUpdateProfileRequest req) {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        UserResponse updatedUser = userService.updateProfile(userId, req)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return ApiResponse.<UserResponse>builder()
                .message("user.update.success")
                .data(updatedUser)
                .build();
    }
    @PutMapping("/me/avatar")
    @PreAuthorize("hasAnyAuthority('USER','EMPLOYEE','ADMIN')")
    public ApiResponse<UserResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String avatarUrl;
        try {
            avatarUrl = uploadImage.uploadImage(file);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload avatar", e);
        }

        UserResponse updatedUser = userService.updateAvatar(userId, new UserUpdateAvatarRequest(avatarUrl))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ApiResponse.<UserResponse>builder()
                .message("user.update.avatar.success")
                .data(updatedUser)
                .build();
    }

    @PutMapping("/me/password")
    @PreAuthorize("hasAnyAuthority('USER','EMPLOYEE','ADMIN')")
    public ResponseEntity<Void> changePassword(@RequestBody UserChangePasswordRequest req) {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        userService.changePassword(userId, req);
        return ResponseEntity.noContent().build();
    }


    @DeleteMapping("/me")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<Void> deleteAccount() {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        userService.delete(userId);
        return ResponseEntity.noContent().build();
    }
}
