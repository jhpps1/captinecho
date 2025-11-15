package com.captainecho.captainecho.ai.application;

import com.captainecho.captainecho.ai.client.AiServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AI Service 비동기 호출 서비스
 * 초기진단 완료 후 백그라운드에서 커리큘럼 및 문제 생성
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final AiServiceClient aiServiceClient;

    /**
     * 커리큘럼 및 문제 생성 비동기 처리
     *
     * 실행 순서:
     * 1. 커리큘럼 생성 (동기 대기)
     * 2. 문제 생성 (커리큘럼 완료 후 실행)
     *
     * @param studentId 학생 ID
     */
    @Async
    @Transactional
    public void generateCurriculumAndProblemsAsync(Long studentId) {
        try {
            log.info("[AI Service Async] 커리큘럼/문제 생성 시작 - studentId: {}", studentId);

            // 1. 커리큘럼 생성 (동기 대기 - 2-3분 소요)
            aiServiceClient.generateCurriculum(studentId);
            log.info("[AI Service Async] 커리큘럼 생성 완료 - studentId: {}", studentId);

            // 2. 문제 생성 (커리큘럼 완료 후 실행 - 1-2분 소요)
            aiServiceClient.generateProblems(studentId);
            log.info("[AI Service Async] 문제 생성 완료 - studentId: {}", studentId);

            log.info("[AI Service Async] 모든 작업 완료 - studentId: {}", studentId);

        } catch (Exception e) {
            log.error("[AI Service Async] 작업 실패 - studentId: {}, error: {}",
                      studentId, e.getMessage(), e);
            // 예외를 로깅만 하고 전파하지 않음 (비동기 작업 실패해도 초기진단 완료는 유지)
        }
    }
}
