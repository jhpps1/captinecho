package com.captainecho.captainecho.session.domain;

import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 오류 패턴 Entity
 * 학생의 자모 혼동 패턴을 기록
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "error_pattern")
public class ErrorPattern {

    /**
     * 상세 오류 패턴 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "error_pattern_id")
    private Integer errorPatternId;

    /**
     * 상세 기록 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_detail_id", nullable = false)
    private SessionDetail sessionDetail;

    /**
     * 학생 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /**
     * 실제 자모
     */
    @Column(name = "real_jamo", nullable = false, length = 1)
    private Character realJamo;

    /**
     * 혼동 자모
     */
    @Column(name = "confusion_jamo", nullable = false, length = 1)
    private Character confusionJamo;

    /**
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 음소 위치 (초성/중성/종성)
     */
    @Column(name = "phoneme_position", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private PhonemePosition phonemePosition;

    /**
     * 단어 타입 (의미/무의미)
     */
    @Column(name = "syllable_type", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private SyllableType syllableType;

    @Builder
    public ErrorPattern(SessionDetail sessionDetail, Student student, Character realJamo,
                        Character confusionJamo, PhonemePosition phonemePosition, SyllableType syllableType) {
        this.sessionDetail = sessionDetail;
        this.student = student;
        this.realJamo = realJamo;
        this.confusionJamo = confusionJamo;
        this.phonemePosition = phonemePosition;
        this.syllableType = syllableType;
    }
}
