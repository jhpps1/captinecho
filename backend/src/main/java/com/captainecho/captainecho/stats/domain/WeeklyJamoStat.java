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

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "weekly_jamo_stat")
public class WeeklyJamoStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    private Integer statId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private WeeklyPersonalReport weeklyPersonalReport;

    @Column(name = "jamo", nullable = false, length = 5)
    private String jamo;

    @Column(name = "total_attempts", nullable = false)
    @ColumnDefault("0")
    private Short totalAttempts = 0;

    @Column(name = "fail_count", nullable = false)
    @ColumnDefault("0")
    private Short failCount = 0;

    @Column(name = "weekly_fail_rate", nullable = false)
    private Double weeklyFailRate;

    @Column(name = "weekly_accuracy_rate", nullable = false)
    private Double weeklyAccuracyRate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public WeeklyJamoStat(Student student, WeeklyPersonalReport weeklyPersonalReport, String jamo, Short totalAttempts,
                          Short failCount, Double weeklyFailRate, Double weeklyAccuracyRate) {
        this.student = student;
        this.weeklyPersonalReport = weeklyPersonalReport;
        this.jamo = jamo;
        this.totalAttempts = totalAttempts != null ? totalAttempts : 0;
        this.failCount = failCount != null ? failCount : 0;
        this.weeklyFailRate = weeklyFailRate;
        this.weeklyAccuracyRate = weeklyAccuracyRate;
    }
}
