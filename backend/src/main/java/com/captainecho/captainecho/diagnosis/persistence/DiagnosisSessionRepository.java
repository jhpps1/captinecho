package com.captainecho.captainecho.diagnosis.persistence;

import com.captainecho.captainecho.diagnosis.domain.DiagnosisSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiagnosisSessionRepository extends JpaRepository<DiagnosisSession, Integer> {

    /**
     * 학생 ID로 진단 세션 조회
     */
    Optional<DiagnosisSession> findByStudentId(Integer studentId);
}
