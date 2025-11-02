package com.captainecho.captainecho.session.domain;

import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "error_pattern")
public class ErrorPattern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "error_pattern_id")
    private Integer errorPatternId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_detail_id", nullable = false)
    private SessionDetail sessionDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "real_jamo", nullable = false, length = 1)
    private Character realJamo;

    @Column(name = "confusion_jamo", nullable = false, length = 1)
    private Character confusionJamo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "phoneme_position", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private PhonemePosition phonemePosition;

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
