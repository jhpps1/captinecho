package com.captainecho.captainecho.student.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 레벨 히스토리 Entity
 * 학생의 레벨 변경 이력을 관리
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "level_history")
public class LevelHistory {

    /**
     * 레벨 히스토리 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "level_history_id")
    private Integer levelHistoryId;

    /**
     * 학생 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /**
     * 이전 레벨
     */
    @Column(name = "prev_level", nullable = false)
    private Short prevLevel;

    /**
     * 변경 후 레벨
     */
    @Column(name = "new_level", nullable = false)
    private Short newLevel;

    /**
     * 변경 사유
     * 예: "관리자 조정", "커리큘럼 결과" 등
     */
    @Column(name = "reason", nullable = false, length = 300)
    private String reason;

    /**
     * 변경 일시
     */
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
