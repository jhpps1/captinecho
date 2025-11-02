package com.captainecho.captainecho.stats.domain;

import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 자모 통계 Entity
 * 학생별 자모 학습 통계 (누적 데이터)
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "jamo_stat")
public class JamoStat {

    /**
     * 통계 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    private Integer statId;

    /**
     * 학생 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /**
     * 자모 (자음, 모음)
     * PhonemeFeature 테이블에서 해당 자모의 음소 자질 정보를 참조 가능
     */
    @Column(name = "jamo", nullable = false, length = 5)
    private String jamo;

    /**
     * 총 시도 횟수
     */
    @Column(name = "total_attempts", nullable = false)
    @ColumnDefault("0")
    private Short totalAttempts = 0;

    /**
     * 실패 횟수
     */
    @Column(name = "fail_count", nullable = false)
    @ColumnDefault("0")
    private Short failCount = 0;

    /**
     * 주간 실패율
     */
    @Column(name = "weekly_fail_rate", nullable = false)
    private Double weeklyFailRate;

    /**
     * 주간 정확도
     */
    @Column(name = "weekly_accuracy_rate", nullable = false)
    private Double weeklyAccuracyRate;

    /**
     * 갱신일시
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public JamoStat(Student student, String jamo, Short totalAttempts, Short failCount,
                    Double weeklyFailRate, Double weeklyAccuracyRate, LocalDateTime updatedAt) {
        this.student = student;
        this.jamo = jamo;
        this.totalAttempts = totalAttempts != null ? totalAttempts : 0;
        this.failCount = failCount != null ? failCount : 0;
        this.weeklyFailRate = weeklyFailRate;
        this.weeklyAccuracyRate = weeklyAccuracyRate;
        this.updatedAt = updatedAt;
    }
}
