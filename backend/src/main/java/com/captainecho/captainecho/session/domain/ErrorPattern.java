package com.captainecho.captainecho.session.domain;

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
    @JoinColumn(name = "session_id", nullable = false)
    private LearningSession learningSession;

    @Column(name = "real_jamo", nullable = false, length = 1)
    private Character realJamo;

    @Column(name = "confusion_jamo", nullable = false, length = 1)
    private Character confusionJamo;

    @Column(name = "phoneme_position", length = 10)
    @Enumerated(EnumType.STRING)
    private PhonemePosition phonemePosition;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public ErrorPattern(LearningSession learningSession, Character realJamo,
                        Character confusionJamo, PhonemePosition phonemePosition) {
        this.learningSession = learningSession;
        this.realJamo = realJamo;
        this.confusionJamo = confusionJamo;
        this.phonemePosition = phonemePosition;
    }
}
