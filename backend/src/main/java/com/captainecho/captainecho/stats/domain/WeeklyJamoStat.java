package com.captainecho.captainecho.stats.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 주간 자모 통계 Entity
 * 주간 리포트의 자모별 상세 통계
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "weekly_jamo_stat")
public class WeeklyJamoStat {

    /**
     * 통계 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    private Integer statId;

    /**
     * 리포트 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private WeeklyPersonalReport weeklyPersonalReport;

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
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public WeeklyJamoStat(WeeklyPersonalReport weeklyPersonalReport, String jamo, Short totalAttempts,
                          Short failCount, Double weeklyFailRate, Double weeklyAccuracyRate) {
        this.weeklyPersonalReport = weeklyPersonalReport;
        this.jamo = jamo;
        this.totalAttempts = totalAttempts != null ? totalAttempts : 0;
        this.failCount = failCount != null ? failCount : 0;
        this.weeklyFailRate = weeklyFailRate;
        this.weeklyAccuracyRate = weeklyAccuracyRate;
    }
}
