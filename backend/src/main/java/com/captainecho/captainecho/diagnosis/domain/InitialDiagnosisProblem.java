package com.captainecho.captainecho.diagnosis.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 초기 진단 문제 Entity
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "initial_diagnosis_problem")
public class InitialDiagnosisProblem {

    /**
     * 초기 진단 문제 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "initial_diagnosis_problem_id")
    private Integer initialDiagnosisProblemId;

    /**
     * 문제 유형
     * 듣기/읽기/쓰기/음소 인식
     */
    @Column(name = "diagnosis_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private DiagnosisType diagnosisType;

    /**
     * 문제
     */
    @Column(name = "problem", nullable = false, length = 500)
    private String problem;

    /**
     * 보기 선택지
     */
    @Column(name = "choices", columnDefinition = "TEXT[]")
    private String[] choices;

    /**
     * 문제 이미지 URL
     */
    @Column(name = "problem_image_url", length = 2048)
    private String problemImageUrl;

    /**
     * 문제 음성 URL (모범 발음)
     */
    @Column(name = "problem_sound_url", length = 2048)
    private String problemSoundUrl;

    /**
     * 정답
     */
    @Column(name = "correct_answer", nullable = false, length = 500)
    private String correctAnswer;

    @Builder
    public InitialDiagnosisProblem(DiagnosisType diagnosisType, String problem, String[] choices,
                                   String problemImageUrl, String problemSoundUrl, String correctAnswer) {
        this.diagnosisType = diagnosisType;
        this.problem = problem;
        this.choices = choices;
        this.problemImageUrl = problemImageUrl;
        this.problemSoundUrl = problemSoundUrl;
        this.correctAnswer = correctAnswer;
    }
}
