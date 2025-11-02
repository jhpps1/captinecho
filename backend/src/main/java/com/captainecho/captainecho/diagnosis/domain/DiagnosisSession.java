package com.captainecho.captainecho.diagnosis.domain;

import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 진단 세션 Entity
 * 초기 진단 세션 정보를 관리
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "diagnosis_session")
public class DiagnosisSession {

    /**
     * 학생 ID (PK, FK)
     */
    @Id
    @Column(name = "student_id")
    private Integer studentId;

    /**
     * 학생 (FK)
     */
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "student_id")
    private Student student;

    /**
     * 시작 시간
     */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * 종료 시간
     */
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Builder
    public DiagnosisSession(Student student, LocalDateTime startTime, LocalDateTime endTime) {
        this.student = student;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
