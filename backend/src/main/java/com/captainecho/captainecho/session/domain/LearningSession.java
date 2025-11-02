package com.captainecho.captainecho.session.domain;

import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 학습 세션 Entity
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "learning_session")
public class LearningSession {

    /**
     * 세션 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId;

    /**
     * 학생 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /**
     * 학습 타입 (DAILY or SUPPLE)
     */
    @Column(name = "study_type", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private StudyType studyType;

    /**
     * 시작 일시 (학습 시작 시간)
     */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * 종료 일시 (학습 종료 시간)
     */
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    /**
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public LearningSession(Student student, StudyType studyType, LocalDateTime startTime, LocalDateTime endTime) {
        this.student = student;
        this.studyType = studyType;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
