package com.manfashion.springboot_be.config;

import com.manfashion.springboot_be.entity.Role;
import com.manfashion.springboot_be.entity.User;
import com.manfashion.springboot_be.repository.Role.RoleRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AdminSeeder {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seedAdmin() {
        if (userRepository.findByEmail("admin@system.local").isPresent()) return;

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        User admin = User.builder()
                .email("admin@system.local")
                .password(passwordEncoder.encode("Adm!n9Kx"))
                .role(adminRole)
                .fullName("System Admin")
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(admin);

        System.out.println("✅ ADMIN SEEDED SUCCESSFULLY");
    }
}
