# Spring Boot 스케줄러 구현 가이드

## 개요

AI Service의 배치 작업을 Spring Boot 스케줄러로 이전하여 관심사의 분리를 구현합니다.

- **AI Service (FastAPI)**: Stateless REST API 제공
- **Spring Boot**: 비즈니스 로직 + 스케줄링 관리

---

## 1. 스케줄러 활성화

### `CaptainEchoApplication.java` 수정

```java
package com.captainecho;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // ← 스케줄러 활성화
public class CaptainEchoApplication {
    public static void main(String[] args) {
        SpringApplication.run(CaptainEchoApplication.class, args);
    }
}
```

---

## 2. AI Service Client 생성

### `AiServiceClient.java`

```java
package com.captainecho.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;  // application.yml: http://localhost:8000 또는 AI 서버 URL

    /**
     * 커리큘럼 생성 API 호출
     *
     * @param studentId 학생 ID
     * @return API 응답 (report_id, curriculum_structure 등)
     */
    public Map<String, Object> generateCurriculum(Long studentId) {
        String url = aiServiceUrl + "/api/curriculum/generate/" + studentId;

        try {
            log.info("[AI Service] 커리큘럼 생성 시작 - Student ID: {}", studentId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // POST 요청 (Body 없음, student_id는 Path Variable)
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("[AI Service] 커리큘럼 생성 성공 - Report ID: {}, Elapsed: {}",
                    result.get("report_id"), result.get("elapsed_time"));
                return result;
            } else {
                log.error("[AI Service] 커리큘럼 생성 실패 - Status: {}", response.getStatusCode());
                return null;
            }

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("[AI Service] HTTP 에러 - Status: {}, Body: {}",
                e.getStatusCode(), e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            log.error("[AI Service] 커리큘럼 생성 실패 - Student ID: {}, Error: {}",
                studentId, e.getMessage());
            return null;
        }
    }

    /**
     * 문제 생성 API 호출
     *
     * @param studentId 학생 ID
     * @return API 응답 (generated_count, problems 등)
     */
    public Map<String, Object> generateProblems(Long studentId) {
        String url = aiServiceUrl + "/api/problems/generate/" + studentId;

        try {
            log.info("[AI Service] 문제 생성 시작 - Student ID: {}", studentId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("[AI Service] 문제 생성 성공 - Count: {}", result.get("generated_count"));
                return result;
            } else {
                log.error("[AI Service] 문제 생성 실패 - Status: {}", response.getStatusCode());
                return null;
            }

        } catch (Exception e) {
            log.error("[AI Service] 문제 생성 실패 - Student ID: {}, Error: {}",
                studentId, e.getMessage());
            return null;
        }
    }
}
```

---

## 3. 주간 배치 스케줄러 생성

### `WeeklyCurriculumScheduler.java`

```java
package com.captainecho.scheduler;

import com.captainecho.repository.StudentRepository;
import com.captainecho.service.AiServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeeklyCurriculumScheduler {

    private final StudentRepository studentRepository;
    private final AiServiceClient aiServiceClient;

    /**
     * 매주 일요일 23:00 (KST)에 전체 학생 대상 커리큘럼 + 문제 자동 생성
     *
     * Cron 표현식: 초 분 시 일 월 요일
     * - "0 0 23 * * SUN" → 일요일 23시 0분 0초
     */
    @Scheduled(cron = "0 0 23 * * SUN", zone = "Asia/Seoul")
    @Transactional
    public void generateWeeklyCurriculumForAllStudents() {
        log.info("=".repeat(80));
        log.info("[BATCH] 주간 커리큘럼 생성 배치 시작");
        log.info("=".repeat(80));

        // 1. 모든 활성 학생 조회
        List<Long> studentIds = studentRepository.findAllActiveStudentIds();
        log.info("[BATCH] 대상 학생 수: {}명", studentIds.size());

        int successCount = 0;
        int failCount = 0;

        // 2. 각 학생별로 커리큘럼 + 문제 생성
        for (Long studentId : studentIds) {
            try {
                log.info("-".repeat(80));
                log.info("[BATCH] Student ID {} 처리 중...", studentId);

                // 2-1. 커리큘럼 생성
                Map<String, Object> curriculumResult = aiServiceClient.generateCurriculum(studentId);
                if (curriculumResult == null || !"success".equals(curriculumResult.get("status"))) {
                    log.error("[BATCH] Student ID {} 커리큘럼 생성 실패", studentId);
                    failCount++;
                    continue;
                }

                // 2-2. 문제 생성
                Map<String, Object> problemResult = aiServiceClient.generateProblems(studentId);
                if (problemResult == null || !"success".equals(problemResult.get("status"))) {
                    log.error("[BATCH] Student ID {} 문제 생성 실패", studentId);
                    failCount++;
                    continue;
                }

                log.info("[BATCH] Student ID {} 완료 - 커리큘럼: Report ID {}, 문제: {}개",
                    studentId,
                    curriculumResult.get("report_id"),
                    problemResult.get("generated_count"));

                successCount++;

            } catch (Exception e) {
                log.error("[BATCH] Student ID {} 처리 중 오류: {}", studentId, e.getMessage(), e);
                failCount++;
            }
        }

        log.info("=".repeat(80));
        log.info("[BATCH] 주간 커리큘럼 생성 배치 완료 - 성공: {}명, 실패: {}명", successCount, failCount);
        log.info("=".repeat(80));
    }
}
```

---

## 4. 초기진단 완료 후 즉시 생성

### `DiagnosisService.java` (또는 초기진단 처리 서비스)

```java
package com.captainecho.service;

import com.captainecho.entity.DiagnosisSession;
import com.captainecho.repository.DiagnosisSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiagnosisService {

    private final DiagnosisSessionRepository diagnosisSessionRepository;
    private final AiServiceClient aiServiceClient;

    /**
     * 초기진단 완료 처리
     *
     * @param sessionId 진단 세션 ID
     * @param studentId 학생 ID
     */
    @Transactional
    public void completeDiagnosis(Long sessionId, Long studentId) {
        log.info("[DIAGNOSIS] 초기진단 완료 - Session ID: {}, Student ID: {}", sessionId, studentId);

        // 1. 진단 세션 상태 업데이트
        DiagnosisSession session = diagnosisSessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalArgumentException("진단 세션을 찾을 수 없습니다."));

        session.setCompleted(true);
        diagnosisSessionRepository.save(session);

        // 2. 즉시 커리큘럼 생성 (비동기 권장)
        try {
            log.info("[DIAGNOSIS] 커리큘럼 자동 생성 시작 - Student ID: {}", studentId);
            Map<String, Object> curriculumResult = aiServiceClient.generateCurriculum(studentId);

            if (curriculumResult != null && "success".equals(curriculumResult.get("status"))) {
                log.info("[DIAGNOSIS] 커리큘럼 생성 성공 - Report ID: {}", curriculumResult.get("report_id"));

                // 3. 즉시 문제 생성
                log.info("[DIAGNOSIS] 문제 자동 생성 시작 - Student ID: {}", studentId);
                Map<String, Object> problemResult = aiServiceClient.generateProblems(studentId);

                if (problemResult != null && "success".equals(problemResult.get("status"))) {
                    log.info("[DIAGNOSIS] 문제 생성 성공 - Count: {}", problemResult.get("generated_count"));
                } else {
                    log.error("[DIAGNOSIS] 문제 생성 실패 - Student ID: {}", studentId);
                }
            } else {
                log.error("[DIAGNOSIS] 커리큘럼 생성 실패 - Student ID: {}", studentId);
            }
        } catch (Exception e) {
            log.error("[DIAGNOSIS] AI Service 호출 실패 - Student ID: {}, Error: {}", studentId, e.getMessage(), e);
        }
    }

    /**
     * 비동기 처리 (권장)
     * 초기진단 완료 후 사용자 응답 속도 향상을 위해 비동기로 처리
     */
    @Async
    @Transactional
    public void completeDiagnosisAsync(Long sessionId, Long studentId) {
        completeDiagnosis(sessionId, studentId);
    }
}
```

---

## 5. 설정 파일

### `application.yml`

```yaml
# AI Service 설정
ai:
  service:
    url: http://localhost:8000  # 개발 환경
    # url: http://ai-service:8000  # Docker 환경
    # url: http://AI_SERVER_IP:8000  # 프로덕션

spring:
  task:
    scheduling:
      pool:
        size: 5  # 스케줄러 스레드 풀 크기
```

### `RestTemplate` Bean 등록

```java
package com.captainecho.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(10))  // 연결 타임아웃 10초
            .setReadTimeout(Duration.ofMinutes(5))      // 읽기 타임아웃 5분 (CrewAI 실행 시간 고려)
            .build();
    }
}
```

---

## 6. Repository 메서드 추가

### `StudentRepository.java`

```java
package com.captainecho.repository;

import com.captainecho.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    /**
     * 모든 활성 학생 ID 조회 (삭제되지 않은 학생)
     */
    @Query("SELECT s.studentId FROM Student s WHERE s.isDeleted = false")
    List<Long> findAllActiveStudentIds();
}
```

---

## 7. 스케줄러 테스트

### 수동 테스트용 Controller

```java
package com.captainecho.controller;

import com.captainecho.scheduler.WeeklyCurriculumScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class SchedulerTestController {

    private final WeeklyCurriculumScheduler scheduler;

    /**
     * 수동으로 주간 배치 실행 (테스트용)
     *
     * GET /api/test/run-weekly-batch
     */
    @GetMapping("/run-weekly-batch")
    public ResponseEntity<String> runWeeklyBatch() {
        scheduler.generateWeeklyCurriculumForAllStudents();
        return ResponseEntity.ok("주간 배치 실행 완료");
    }
}
```

---

## 8. Cron 표현식 참고

| 표현식 | 설명 |
|--------|------|
| `0 0 23 * * SUN` | 매주 일요일 23:00 |
| `0 0 0 * * MON` | 매주 월요일 00:00 |
| `0 0 9 * * MON-FRI` | 평일 매일 09:00 |
| `0 */30 * * * *` | 30분마다 |

---

## 9. 로그 확인

```bash
# 배치 실행 로그 확인
tail -f logs/spring-boot.log | grep BATCH

# 특정 학생 처리 로그
tail -f logs/spring-boot.log | grep "Student ID 7"
```

---

## 10. 주의사항

1. **타임아웃 설정**: CrewAI 실행 시간이 2-3분 소요되므로 RestTemplate의 `readTimeout`을 5분 이상으로 설정
2. **에러 처리**: 한 학생이 실패해도 다른 학생 처리를 계속하도록 try-catch 구현
3. **트랜잭션 분리**: 각 학생별로 독립적인 트랜잭션 처리 (한 학생 실패가 전체 롤백으로 이어지지 않도록)
4. **비동기 처리**: 초기진단 완료 후 즉시 생성은 `@Async` 사용 권장 (사용자 응답 속도 향상)

---

## 완성!

이제 Spring Boot가 스케줄링을 담당하고, AI Service는 순수 API로만 동작합니다.
