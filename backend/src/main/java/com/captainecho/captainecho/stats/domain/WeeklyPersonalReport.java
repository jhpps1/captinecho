package com.captainecho.captainecho.stats.domain;

import com.captainecho.captainecho.config.JsonConverter;
import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "weekly_personal_report")
public class WeeklyPersonalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Integer reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "total_time")
    @ColumnDefault("0")
    private Integer totalTime = 0;

    @Column(name = "curriculum", columnDefinition = "TEXT")
    private String curriculum;

    @Column(name = "curriculum_structure", columnDefinition = "jsonb")
    @Convert(converter = JsonConverter.class)
    private Map<String, Object> curriculumStructure;

    @Column(name = "discussion_log", columnDefinition = "json")
    private String discussionLog;

    @Column(name = "protector_goal", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ProtectorGoal protectorGoal;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public WeeklyPersonalReport(Student student, Integer totalTime,
                                String curriculum, Map<String, Object> curriculumStructure,
                                String discussionLog, ProtectorGoal protectorGoal) {
        this.student = student;
        this.totalTime = totalTime != null ? totalTime : 0;
        this.curriculum = curriculum;
        this.curriculumStructure = curriculumStructure;
        this.discussionLog = discussionLog;
        this.protectorGoal = protectorGoal;
    }

    public void updateProtectorGoal(ProtectorGoal protectorGoal) {
        this.protectorGoal = protectorGoal;
    }
}
