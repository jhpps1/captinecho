package com.captainecho.captainecho.auth.filter;

import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.jwt.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        log.info("=== JWT Filter - Request: {} ===", requestURI);

        // 1. Authorization 헤더에서 토큰 추출
        String token = extractToken(request);
        log.info("Token extracted: {}", token != null ? "YES (length: " + token.length() + ")" : "NO");

        // 2. 토큰이 있고 유효하면 인증 정보 설정
        if (token != null) {
            boolean isValid = jwtUtil.validateToken(token);
            log.info("Token validation result: {}", isValid ? "VALID" : "INVALID");

            if (isValid) {
                Integer protectorId = jwtUtil.getProtectorId(token);
                log.info("Authenticated protectorId: {}", protectorId);

                ProtectorPrincipal principal = new ProtectorPrincipal(protectorId);

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("Authentication set successfully for protectorId: {}", protectorId);
            } else {
                log.warn("Token validation failed for request: {}", requestURI);
            }
        } else {
            log.warn("No token found in request: {}", requestURI);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
