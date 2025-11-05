package com.captainecho.captainecho.diagnosis.domain;

import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "diagnosis_session")
public class DiagnosisSession {

    @Id
    @Column(name = "student_id")
    private Integer studentId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Builder
    public DiagnosisSession(Student student, LocalDateTime startTime, LocalDateTime endTime) {
        this.student = student;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    /**
     * 진단 종료 시간 설정
     */
    public void endDiagnosis(LocalDateTime endTime) {
        this.endTime = endTime;
    }
}
