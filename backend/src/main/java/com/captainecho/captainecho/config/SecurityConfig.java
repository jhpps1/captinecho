package com.captainecho.captainecho.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                // 개발 환경: 모든 요청 허용
                .anyRequest().permitAll()
            )
            .csrf(csrf -> csrf.disable()); // 개발 편의를 위해 CSRF 비활성화

        return http.build();
    }
}
