package com.manfashion.springboot_be.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // 🟢 Bỏ qua xác thực cho các endpoint đăng nhập/đăng ký
        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 🔍 Lấy Authorization header
        String header = request.getHeader("Authorization");

        // Kiểm tra header có "Bearer <token>" không
        if (header != null && header.startsWith("Bearer ")) {

            // Tách token từ "Bearer <token>"
            String token = header.substring(7);

            try {
                // ✅ Xác thực token
                if (jwtUtils.validateJwtToken(token)) {
                    String userId = jwtUtils.getUserIdFromJwtToken(token);
                    String role = jwtUtils.getRoleFromJwtToken(token);

                    // 🔑 Tạo Authentication object
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userId,                              // Principal (user ID)
                                    null,                                // Credentials (không cần)
                                    List.of(new SimpleGrantedAuthority(role))  // Authorities (role)
                            );

                    // 📌 Lưu vào SecurityContext (các controller có thể lấy được)
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
            // ❌ Token hết hạn
            catch (io.jsonwebtoken.ExpiredJwtException ex) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Access token expired\"}");
                return;
            }
            // ❌ Token không hợp lệ
            catch (Exception ex) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid token\"}");
                return;
            }
        } else {
            // ✅ Không có token → coi là Guest user
            UsernamePasswordAuthenticationToken guestAuth =
                    new UsernamePasswordAuthenticationToken(
                            "guest",
                            null,
                            List.of(new SimpleGrantedAuthority("GUEST"))
                    );
            SecurityContextHolder.getContext().setAuthentication(guestAuth);
        }

        // ➡️ Tiếp tục xử lý request
        filterChain.doFilter(request, response);
    }
}
