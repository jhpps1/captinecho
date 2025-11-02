package com.captainecho.captainecho.diagnosis.domain;

import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "initial_diagnosis_result")
public class InitialDiagnosisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "initial_diagnosis_result_id")
    private Integer initialDiagnosisResultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initial_diagnosis_problem_id", nullable = false)
    private InitialDiagnosisProblem initialDiagnosisProblem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "student_answer", nullable = false, length = 500)
    private String studentAnswer;

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
