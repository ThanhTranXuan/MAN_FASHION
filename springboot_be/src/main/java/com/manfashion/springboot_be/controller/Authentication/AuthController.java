package com.manfashion.springboot_be.controller.Authentication;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Authentication.AuthenticationRequest;
import com.manfashion.springboot_be.DTO.Authentication.AuthenticationResponse;
import com.manfashion.springboot_be.DTO.User.UserCreateRequest;
import com.manfashion.springboot_be.DTO.User.UserResponse;
import com.manfashion.springboot_be.service.Authentication.auth.AuthenticationService;
import com.manfashion.springboot_be.service.User.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationService authenticationService;
    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody UserCreateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message(("user.create.success"))
                .data(userService.createUser(request))
                .build();
    }
    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@Valid @RequestBody AuthenticationRequest request) {
        AuthenticationResponse result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .message(("auth.login.success"))
                .data(result)
                .build();
    }
    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refresh(@RequestParam("refresh_token") String refreshToken) {
        AuthenticationResponse result = authenticationService.refreshToken(refreshToken);
        return ApiResponse.<AuthenticationResponse>builder()
                .message(("auth.refresh.success"))
                .data(result)
                .build();
    }


    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestParam String email) {
        String result = authenticationService.forgotPassword(email);
        return ApiResponse.<String>builder()
                .message(("auth.forgotPassword.success"))
                .data(result)
                .build();
    }

        @PostMapping("/reset-password")
        public ApiResponse<String> resetPassword(@RequestBody Map<String, String> body) {
            String token = body.get("token");
            String newPassword = body.get("new_password");
            String result = authenticationService.resetPassword(token,newPassword);
            return ApiResponse.<String>builder()
                    .message(("auth.resetPassword.success"))
                    .data(result)
                    .build();
        }


}
