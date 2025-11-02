package com.captainecho.captainecho.adventure.domain;

import com.captainecho.captainecho.interest.domain.SubInterest;
import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 일일 문제 Entity
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "day_problem")
public class DayProblem {

    /**
     * 일일 문제 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "day_problem_id")
    private Integer dayProblemId;

    /**
     * 학생 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /**
     * 관심사 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interest_id", nullable = false)
    private SubInterest subInterest;

    /**
     * 탐험 타입 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adventure_type_id", nullable = false)
    private AdventureType adventureType;

    /**
     * 지정 학습 일자
     */
    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    /**
     * 문제 순번 (1-10)
     */
    @Column(name = "seq_no", nullable = false)
    private Short seqNo;

    /**
     * 레벨
     */
    @Column(name = "level", nullable = false)
    private Short level;

    /**
     * 문제
     * 예: "고구마", "별똥별이 떨어진다" 등
     */
    @Column(name = "question_text", nullable = false, length = 150)
    private String questionText;

    /**
     * 힌트
     */
    @Column(name = "hint", length = 300)
    private String hint;

    /**
     * 이미지 URL
     */
    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    /**
     * 음성 URL
     */
    @Column(name = "sound_url", nullable = false, length = 2048)
    private String soundUrl;

    /**
     * 문제 음소들
     * 예: ["ㄱ,ㅏ"], ["ㄱ,ㅗ,ㅇ,ㄹ,ㅛ,ㅇ"]
     */
    @Column(name = "question_phonemes", nullable = false, columnDefinition = "TEXT[]")
    private String[] questionPhonemes;

    /**
     * 빈칸 위치
     * 탐험 1 전용, 초성/중성/종성
     */
    @Column(name = "blank_position", length = 20)
    @Enumerated(EnumType.STRING)
    private BlankPosition blankPosition;

    /**
     * 빈칸 음소
     * 탐험 1,2 전용
     */
    @Column(name = "blank_phoneme", length = 5)
    private String blankPhoneme;

    /**
     * 보기 선택지
     * 탐험 1,2,3 전용 ["ㅏ","ㅣ","ㅑ"]
     */
    @Column(name = "choices", columnDefinition = "TEXT[]")
    private String[] choices;

    /**
     * 정답
     * 탐험 1,2,3 전용
     */
    @Column(name = "correct_answer", length = 5)
    private String correctAnswer;

    /**
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 완료 여부
     */
    @Column(name = "is_completed", nullable = false)
    @ColumnDefault("false")
    private Boolean isCompleted = false;

    @Builder
    public DayProblem(Student student, SubInterest subInterest, AdventureType adventureType,
                      LocalDate assignedDate, Short seqNo, Short level, String questionText,
                      String hint, String imageUrl, String soundUrl, String[] questionPhonemes,
                      BlankPosition blankPosition, String blankPhoneme, String[] choices,
                      String correctAnswer) {
        this.student = student;
        this.subInterest = subInterest;
        this.adventureType = adventureType;
        this.assignedDate = assignedDate;
        this.seqNo = seqNo;
        this.level = level;
        this.questionText = questionText;
        this.hint = hint;
        this.imageUrl = imageUrl;
        this.soundUrl = soundUrl;
        this.questionPhonemes = questionPhonemes;
        this.blankPosition = blankPosition;
        this.blankPhoneme = blankPhoneme;
        this.choices = choices;
        this.correctAnswer = correctAnswer;
        this.isCompleted = false;
    }
}
