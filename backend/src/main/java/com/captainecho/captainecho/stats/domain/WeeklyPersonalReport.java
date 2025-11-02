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
 * 주간 개인 리포트 Entity
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "weekly_personal_report")
public class WeeklyPersonalReport {

    /**
     * 리포트 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Integer reportId;

    /**
     * 학생 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /**
     * 총 학습 시간 (초 단위)
     */
    @Column(name = "total_time", nullable = false)
    @ColumnDefault("0")
    private Integer totalTime = 0;

    /**
     * 오답률
     */
    @Column(name = "error_rate", nullable = false)
    private Double errorRate;

    /**
     * 개선률
     * 직전 week의 주간 리포트와 비교
     */
    @Column(name = "improvement_rate", nullable = false)
    private Double improvementRate;

    /**
     * 커리큘럼
     */
    @Column(name = "curriculum", nullable = false, columnDefinition = "TEXT")
    private String curriculum;

    /**
     * 협의 로그
     * 협의 내용 및 도출된 결론 표현
     */
    @Column(name = "discussion_log", nullable = false, columnDefinition = "TEXT")
    private String discussionLog;

    /**
     * 보호자 의사
     * 취약점 집중, 자모 학습 위주 등
     */
    @Column(name = "protector_goal", length = 20)
    @Enumerated(EnumType.STRING)
    private ProtectorGoal protectorGoal;

    /**
     * 생성일시 (주간 리포트 생성일)
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public WeeklyPersonalReport(Student student, Integer totalTime, Double errorRate, Double improvementRate,
                                String curriculum, String discussionLog, ProtectorGoal protectorGoal) {
        this.student = student;
        this.totalTime = totalTime != null ? totalTime : 0;
        this.errorRate = errorRate;
        this.improvementRate = improvementRate;
        this.curriculum = curriculum;
        this.discussionLog = discussionLog;
        this.protectorGoal = protectorGoal;
    }
}
