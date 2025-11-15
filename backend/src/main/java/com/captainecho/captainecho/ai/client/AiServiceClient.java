package com.captainecho.captainecho.ai.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * AI Service HTTP 클라이언트
 * FastAPI 서버와 통신하여 커리큘럼 및 문제 생성 요청
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai-service.url:http://k13d101.p.ssafy.io:8000}")
    private String aiServiceUrl;

    /**
     * 커리큘럼 생성 요청
     *
     * @param studentId 학생 ID
     * @throws RestClientException AI Service 호출 실패 시
     */
    public void generateCurriculum(Long studentId) {
        String url = aiServiceUrl + "/api/curriculum/generate/" + studentId;

        try {
            log.info("[AI Service] 커리큘럼 생성 요청 시작 - studentId: {}, URL: {}", studentId, url);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );

            log.info("[AI Service] 커리큘럼 생성 완료 - studentId: {}, status: {}",
                     studentId, response.getStatusCode());

        } catch (RestClientException e) {
            log.error("[AI Service] 커리큘럼 생성 실패 - studentId: {}, error: {}",
                      studentId, e.getMessage(), e);
            throw e;  // 상위로 예외 전파
        }
    }

    /**
     * 문제 생성 요청
     *
     * @param studentId 학생 ID
     * @throws RestClientException AI Service 호출 실패 시
     */
    public void generateProblems(Long studentId) {
        String url = aiServiceUrl + "/api/problems/generate/" + studentId;

        try {
            log.info("[AI Service] 문제 생성 요청 시작 - studentId: {}, URL: {}", studentId, url);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );

            log.info("[AI Service] 문제 생성 완료 - studentId: {}, status: {}",
                     studentId, response.getStatusCode());

        } catch (RestClientException e) {
            log.error("[AI Service] 문제 생성 실패 - studentId: {}, error: {}",
                      studentId, e.getMessage(), e);
            throw e;  // 상위로 예외 전파
        }
    }
}
