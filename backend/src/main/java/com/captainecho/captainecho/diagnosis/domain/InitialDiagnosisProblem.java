package com.captainecho.captainecho.diagnosis.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "initial_diagnosis_problem")
public class InitialDiagnosisProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "initial_diagnosis_problem_id")
    private Integer initialDiagnosisProblemId;

    @Column(name = "diagnosis_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private DiagnosisType diagnosisType;

    @Column(name = "problem", nullable = false, length = 500)
    private String problem;

    @Column(name = "choices", columnDefinition = "TEXT[]")
    private String[] choices;

    @Column(name = "problem_image_url", length = 2048)
    private String problemImageUrl;

    @Column(name = "problem_sound_url", length = 2048)
    private String problemSoundUrl;

    @Column(name = "correct_answer", nullable = false, length = 500)
    private String correctAnswer;

    @Column(name = "problem_phonemes", columnDefinition = "TEXT[]")
    private String[] problemPhonemes;

    @Column(name = "blank_position", length = 20)
    private String blankPosition;

    @Column(name = "blank_phoneme", length = 5)
    private String blankPhoneme;

    @Builder
    public InitialDiagnosisProblem(DiagnosisType diagnosisType, String problem, String[] choices,
                                   String problemImageUrl, String problemSoundUrl, String correctAnswer,
                                   String[] problemPhonemes, String blankPosition, String blankPhoneme) {
        this.diagnosisType = diagnosisType;
        this.problem = problem;
        this.choices = choices;
        this.problemImageUrl = problemImageUrl;
        this.problemSoundUrl = problemSoundUrl;
        this.correctAnswer = correctAnswer;
        this.problemPhonemes = problemPhonemes;
        this.blankPosition = blankPosition;
        this.blankPhoneme = blankPhoneme;
    }
}
