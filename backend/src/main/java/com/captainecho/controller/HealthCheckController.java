package com.captainecho.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 헬스체크 컨트롤러
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Health Check", description = "서버 상태 확인 API")
public class HealthCheckController {

    @GetMapping("/health")
    @Operation(summary = "헬스체크", description = "서버가 정상 작동 중인지 확인합니다")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Captain Echo Backend");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "서버가 정상 작동 중입니다");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/ping")
    @Operation(summary = "핑 테스트", description = "간단한 응답 테스트")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
