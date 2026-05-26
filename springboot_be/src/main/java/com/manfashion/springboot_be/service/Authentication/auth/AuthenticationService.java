package com.manfashion.springboot_be.service.Authentication.auth;

import com.manfashion.springboot_be.DTO.Authentication.AuthenticationRequest;
import com.manfashion.springboot_be.DTO.Authentication.AuthenticationResponse;
import com.manfashion.springboot_be.DTO.Authentication.SocialLoginRequest;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);

    AuthenticationResponse refreshToken(String refreshToken);

    AuthenticationResponse socialLogin(SocialLoginRequest request);

    String forgotPassword(String email);

    String resetPassword(String token, String newPassword);
}
