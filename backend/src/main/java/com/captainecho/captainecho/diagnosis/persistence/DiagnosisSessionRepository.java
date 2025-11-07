package com.captainecho.captainecho.diagnosis.persistence;

import com.captainecho.captainecho.diagnosis.domain.DiagnosisSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiagnosisSessionRepository extends JpaRepository<DiagnosisSession, Integer> {

    Optional<DiagnosisSession> findByStudentStudentIdAndEndTimeIsNull(Integer studentId);

    boolean existsByStudentStudentIdAndEndTimeIsNull(Integer studentId);
}
