package com.captainecho.captainecho.diagnosis.persistence;

import com.captainecho.captainecho.diagnosis.domain.InitialDiagnosisResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InitialDiagnosisResultRepository extends JpaRepository<InitialDiagnosisResult, Integer> {
    /**
     * 특정 학생의 모든 초기 진단 결과 조회 (문제 정보 포함)
     */
    @Query("""
            SELECT idr
            FROM InitialDiagnosisResult idr
            JOIN FETCH idr.initialDiagnosisProblem idp
            JOIN FETCH idr.student
            WHERE idr.student.studentId = :studentId
            ORDER BY idp.diagnosisType, idr.initialDiagnosisResultId
            """)
    List<InitialDiagnosisResult> findAllByStudentIdWithProblem(@Param("studentId") Integer studentId);
}
