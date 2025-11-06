package com.captainecho.captainecho.session.domain;

import com.captainecho.captainecho.student.domain.Student;
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
@Table(name = "learning_session")
public class LearningSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "study_type", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private StudyType studyType;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

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

    public void updateEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
}
