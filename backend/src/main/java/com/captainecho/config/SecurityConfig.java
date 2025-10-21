package com.captainecho.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 설정
 * 개발 환경과 프로덕션 환경에서 다르게 동작
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * 개발 환경 Security 설정
     * - Swagger UI 접근 허용
     * - Actuator 접근 허용
     * - H2 Console 접근 허용 (필요시)
     */
    @Bean
    @Profile("dev")
    public SecurityFilterChain devSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Swagger 관련 경로 모두 허용
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/api-docs/**",
                    "/swagger-resources/**",
                    "/webjars/**"
                ).permitAll()
                // Actuator 엔드포인트 허용
                .requestMatchers("/actuator/**").permitAll()
                // H2 Console (개발용)
                .requestMatchers("/h2-console/**").permitAll()
                // 나머지는 인증 필요
                .anyRequest().authenticated()
            )
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin()) // H2 Console iframe 허용
            );

        return http.build();
    }

    /**
     * 프로덕션 환경 Security 설정
     * - Swagger 완전 차단 (설정에서 비활성화되지만 추가 보안)
     * - 모든 요청 인증 필요
     */
    @Bean
    @Profile("prod")
    public SecurityFilterChain prodSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Actuator health check만 허용 (로드밸런서/헬스체크용)
                .requestMatchers("/actuator/health").permitAll()
                // Prometheus metrics (모니터링용)
                .requestMatchers("/actuator/prometheus").permitAll()
                // 나머지는 모두 인증 필요
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
