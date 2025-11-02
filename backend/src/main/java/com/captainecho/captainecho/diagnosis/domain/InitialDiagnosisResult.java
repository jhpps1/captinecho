package com.captainecho.captainecho.diagnosis.domain;

import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 초기 진단 결과 Entity
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "initial_diagnosis_result")
public class InitialDiagnosisResult {

    /**
     * 초기 진단 결과 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "initial_diagnosis_result_id")
    private Integer initialDiagnosisResultId;

    /**
     * 초기 진단 문제 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initial_diagnosis_problem_id", nullable = false)
    private InitialDiagnosisProblem initialDiagnosisProblem;

    /**
     * 학생 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /**
     * 학생 답변
     */
    @Column(name = "student_answer", nullable = false, length = 500)
    private String studentAnswer;

    /**
     * 정답 여부
     */
    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Builder
    public InitialDiagnosisResult(InitialDiagnosisProblem initialDiagnosisProblem, Student student,
                                  String studentAnswer, Boolean isCorrect) {
        this.initialDiagnosisProblem = initialDiagnosisProblem;
        this.student = student;
        this.studentAnswer = studentAnswer;
        this.isCorrect = isCorrect;
    }
}
