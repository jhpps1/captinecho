package com.captainecho.captainecho.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * RestTemplate 설정
 * AI Service 호출용 HTTP 클라이언트
 */
@Configuration
public class RestTemplateConfig {

    /**
     * AI Service용 RestTemplate Bean
     * - Connection Timeout: 10초
     * - Read Timeout: 5분 (CrewAI 실행 시간 고려)
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))  // 연결 타임아웃 10초
                .setReadTimeout(Duration.ofMinutes(5))      // 읽기 타임아웃 5분 (CrewAI 2-3분 소요)
                .errorHandler(new DefaultResponseErrorHandler())
                .build();
    }
}
