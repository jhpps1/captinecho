package com.captainecho.captainecho.diagnosis.application;

import com.captainecho.captainecho.diagnosis.application.command.EndDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.result.EndDiagnosisResult;
import com.captainecho.captainecho.diagnosis.domain.DiagnosisSession;
import com.captainecho.captainecho.diagnosis.persistence.DiagnosisSessionRepository;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.DiagnosisErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class DiagnosisService {

    private final DiagnosisSessionRepository diagnosisSessionRepository;

    /**
     * 초기 진단 종료
     */
    @Transactional
    public EndDiagnosisResult endDiagnosis(EndDiagnosisCommand command) {
        // 1. DiagnosisSession 조회
        DiagnosisSession diagnosisSession = diagnosisSessionRepository.findByStudentId(command.studentId())
                .orElseThrow(() -> new EchoException(DiagnosisErrorCode.DIAGNOSIS_SESSION_NOT_FOUND));

        // 2. 이미 종료된 진단인지 확인
        if (diagnosisSession.getEndTime() != null) {
            throw new EchoException(DiagnosisErrorCode.DIAGNOSIS_ALREADY_ENDED);
        }

        // 3. 현재 시간을 endTime으로 설정
        diagnosisSession.endDiagnosis(LocalDateTime.now());

        // 4. 저장 (JPA dirty checking)
        diagnosisSessionRepository.save(diagnosisSession);

        return new EndDiagnosisResult(true);
    }
}
