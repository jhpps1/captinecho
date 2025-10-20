package com.captainecho.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI (Swagger) 설정
 * API 문서 자동 생성 및 JWT 인증 설정
 */
@Configuration
public class OpenApiConfig {

    @Value("${spring.application.name:captain-echo-backend}")
    private String applicationName;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(serverList())
                .components(securityComponents())
                .addSecurityItem(securityRequirement());
    }

    /**
     * API 기본 정보
     */
    private Info apiInfo() {
        return new Info()
                .title("Captain Echo API")
                .version("1.0.0")
                .description("""
                        # Captain Echo (꼬마선장 에코)

                        난독증 어린이를 위한 게임형 학습 플랫폼 API

                        ## 주요 기능
                        - 👨‍👩‍👧 부모/자녀 회원 관리
                        - 🏰 메아리 동굴 (4개 학습 동굴)
                        - 🤖 AI Agent 협상 시스템 (CrewAI)
                        - 🎤 음성 녹음 및 STT/TTS
                        - 📊 약점 분석 및 대시보드
                        - 🏆 업적 및 보상 시스템

                        ## 인증
                        JWT Bearer Token 방식 사용
                        """)
                .contact(new Contact()
                        .name("Captain Echo Team")
                        .email("captain-echo@example.com")
                        .url("https://github.com/captain-echo"))
                .license(new License()
                        .name("Proprietary")
                        .url("https://captain-echo.com/license"));
    }

    /**
     * 서버 목록
     */
    private List<Server> serverList() {
        return List.of(
                new Server()
                        .url("http://localhost:8080")
                        .description("로컬 개발 서버"),
                new Server()
                        .url("http://13.209.41.60:8080")
                        .description("EC2 개발 서버"),
                new Server()
                        .url("https://api.captain-echo.com")
                        .description("프로덕션 서버")
        );
    }

    /**
     * JWT 보안 설정
     */
    private Components securityComponents() {
        return new Components()
                .addSecuritySchemes("bearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT 토큰을 입력하세요 (Bearer 접두사 제외)")
                );
    }

    /**
     * 보안 요구사항
     */
    private SecurityRequirement securityRequirement() {
        return new SecurityRequirement().addList("bearerAuth");
    }
}
