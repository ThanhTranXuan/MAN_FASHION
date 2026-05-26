package com.manfashion.springboot_be.service.Authentication.auth;

import com.manfashion.springboot_be.DTO.Authentication.AuthenticationRequest;
import com.manfashion.springboot_be.DTO.Authentication.AuthenticationResponse;
import com.manfashion.springboot_be.DTO.Authentication.SocialLoginRequest;
import com.manfashion.springboot_be.config.JwtUtils;
import com.manfashion.springboot_be.entity.PasswordResetToken;
import com.manfashion.springboot_be.entity.Role;
import com.manfashion.springboot_be.entity.User;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.repository.PasswordResetToken.PasswordResetTokenRepository;
import com.manfashion.springboot_be.repository.Role.RoleRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import com.manfashion.springboot_be.util.EmailTemplateBuilder;
import com.manfashion.springboot_be.util.SendMail;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService{
    private static final String GOOGLE_PROVIDER = "GOOGLE";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SendMail sendMail;
    private final FirebaseTokenVerifier firebaseTokenVerifier;
    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        Role role = roleRepository.findById(user.getRole().getId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        String accessToken = jwtUtils.generateAccessToken(
                String.valueOf(user.getId()),
                role.getName()
        );
        String refreshToken = jwtUtils.generateRefreshToken(
                String.valueOf(user.getId()),
                role.getName()
        );

        return AuthenticationResponse.builder()
                .message("Login success")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public AuthenticationResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateJwtToken(refreshToken)) {
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        //tai sao khong new integer
        Integer userId = Integer.parseInt(jwtUtils.getUserIdFromJwtToken(refreshToken));
        String roleName = jwtUtils.getRoleFromJwtToken(refreshToken);

        String newAccess = jwtUtils.generateAccessToken(String.valueOf(userId), roleName);
        String newRefresh = jwtUtils.generateRefreshToken(String.valueOf(userId), roleName);

        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return AuthenticationResponse.builder().message("Token refreshed")

                .accessToken(newAccess).refreshToken(newRefresh).build();
    }

    @Override
    @Transactional
    public AuthenticationResponse socialLogin(SocialLoginRequest request) {
        String provider = Optional.ofNullable(request.getProvider())
                .map(String::trim)
                .map(String::toUpperCase)
                .orElse(GOOGLE_PROVIDER);

        if (!GOOGLE_PROVIDER.equals(provider)) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        }

        FirebaseTokenVerifier.FirebaseToken token = firebaseTokenVerifier.verify(request.getIdToken());
        log.info("Firebase Google token verified: uid={}, email={}", token.getUid(), token.getEmail());

        User user = userRepository.findBySocialProviderAndSocialId(GOOGLE_PROVIDER, token.getUid())
                .orElseGet(() -> linkOrCreateGoogleUser(token));

        Role role = roleRepository.findById(user.getRole().getId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        String accessToken = jwtUtils.generateAccessToken(String.valueOf(user.getId()), role.getName());
        String refreshToken = jwtUtils.generateRefreshToken(String.valueOf(user.getId()), role.getName());

        return AuthenticationResponse.builder()
                .message("Login success")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    private User linkOrCreateGoogleUser(FirebaseTokenVerifier.FirebaseToken token) {
        Optional<User> existingByEmail = userRepository.findByEmail(token.getEmail());

        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            if (user.getSocialProvider() != null && !GOOGLE_PROVIDER.equalsIgnoreCase(user.getSocialProvider())) {
                throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
            }
            user.setSocialProvider(GOOGLE_PROVIDER);
            user.setSocialId(token.getUid());
            if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && token.getAvatarUrl() != null) {
                user.setAvatarUrl(token.getAvatarUrl());
            }
            if ((user.getFullName() == null || user.getFullName().isBlank()) && token.getFullName() != null) {
                user.setFullName(token.getFullName());
            }
            return userRepository.save(user);
        }

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        String fallbackName = token.getEmail().split("@")[0];

        User newUser = User.builder()
                .email(token.getEmail())
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName(Optional.ofNullable(token.getFullName()).filter(name -> !name.isBlank()).orElse(fallbackName))
                .avatarUrl(token.getAvatarUrl())
                .role(userRole)
                .socialProvider(GOOGLE_PROVIDER)
                .socialId(token.getUid())
                .build();

        return userRepository.save(newUser);
    }

    @Override
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String token = UUID.randomUUID().toString();
        PasswordResetToken reset = PasswordResetToken.builder().token(token).userId(user.getId()).expiryDate(LocalDateTime.now().plusMinutes(10)).build();
        passwordResetTokenRepository.save(reset);

        String link = "http://localhost:3000/auth/reset-password?token=" + token;
        String name = Optional.ofNullable(user.getFullName()).filter(s -> !s.isEmpty()).orElse(email.split("@")[0]);

        String html = EmailTemplateBuilder.build(name, "Reset Your Password", """
                <p>We received a request to <b style='color:#3182CE;'>reset your password</b>.</p>
                <p>Click the button below to continue.</p>
                <p style='color:#E53E3E;font-weight:bold;'>⚠️ Do not share this link with anyone.</p>
                """, "Reset Password", link);

        boolean sent = sendMail.sendMail(email, "Trendify - Reset Password", html);

        if (!sent) {
            System.err.println("⚠️ Email could not be sent.");
        }

        return "Reset link sent";
    }

    @Override
    public String resetPassword(String token, String newPassword) {
        PasswordResetToken reset = passwordResetTokenRepository.findByToken(token).orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (reset.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        User user = userRepository.findById(reset.getUserId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(reset);
        return "Password reset successful";
    }
}


