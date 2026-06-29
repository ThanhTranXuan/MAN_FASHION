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
        boolean isPublicBotRequest = path.startsWith("/api/v1/bot/");


        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }


        String header = request.getHeader("Authorization");


        if (header != null && header.startsWith("Bearer ")) {


            String token = header.substring(7);

            try {

                if (jwtUtils.validateJwtToken(token)) {
                    String userId = jwtUtils.getUserIdFromJwtToken(token);
                    String role = jwtUtils.getRoleFromJwtToken(token);


                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userId,
                                    null,
                                    List.of(new SimpleGrantedAuthority(role))
                            );


                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }

            catch (io.jsonwebtoken.ExpiredJwtException ex) {
                if (isPublicBotRequest) {
                    setGuestAuthentication();
                    filterChain.doFilter(request, response);
                    return;
                }
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Access token expired\"}");
                return;
            }

            catch (Exception ex) {
                if (isPublicBotRequest) {
                    setGuestAuthentication();
                    filterChain.doFilter(request, response);
                    return;
                }
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid token\"}");
                return;
            }
        } else {

            setGuestAuthentication();
        }


        filterChain.doFilter(request, response);
    }

    private void setGuestAuthentication() {
        UsernamePasswordAuthenticationToken guestAuth =
                new UsernamePasswordAuthenticationToken(
                        "guest",
                        null,
                        List.of(new SimpleGrantedAuthority("GUEST"))
                );
        SecurityContextHolder.getContext().setAuthentication(guestAuth);
    }
}
