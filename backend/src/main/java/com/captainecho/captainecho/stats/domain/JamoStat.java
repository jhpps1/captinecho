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
@Table(name = "jamo_stat")
public class JamoStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    private Integer statId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

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

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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

    /**
     * 정답 기록 (총 시도 횟수만 증가)
     */
    public void recordCorrectAnswer() {
        this.totalAttempts++;
        updateRates();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 오답 기록 (총 시도 횟수 + 실패 횟수 증가)
     */
    public void recordIncorrectAnswer() {
        this.totalAttempts++;
        this.failCount++;
        updateRates();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 주간 실패율과 정확도 계산
     */
    private void updateRates() {
        if (this.totalAttempts > 0) {
            this.weeklyFailRate = (double) this.failCount / this.totalAttempts * 100;
            this.weeklyAccuracyRate = 100.0 - this.weeklyFailRate;
        } else {
            this.weeklyFailRate = 0.0;
            this.weeklyAccuracyRate = 100.0;
        }
    }
}
