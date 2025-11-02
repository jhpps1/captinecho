package com.captainecho.captainecho.student.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "level_history")
public class LevelHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "level_history_id")
    private Integer levelHistoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "prev_level", nullable = false)
    private Short prevLevel;

    @Column(name = "new_level", nullable = false)
    private Short newLevel;

    @Column(name = "reason", nullable = false, length = 300)
    private String reason;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @Builder
    public LevelHistory(Student student, Short prevLevel, Short newLevel, String reason, LocalDateTime changedAt) {
        this.student = student;
        this.prevLevel = prevLevel;
        this.newLevel = newLevel;
        this.reason = reason;
        this.changedAt = changedAt;
    }
}
