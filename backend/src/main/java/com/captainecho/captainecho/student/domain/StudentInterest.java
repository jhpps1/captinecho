package com.captainecho.captainecho.student.domain;

import com.captainecho.captainecho.interest.domain.SubInterest;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 학생 관심사 Entity
 * 학생이 선택한 관심사를 저장
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "student_interest")
public class StudentInterest {

    /**
     * 학생 관심사 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_interest_id")
    private Integer studentInterestId;

    /**
     * 학생 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /**
     * 관심사 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interest_id")
    private SubInterest subInterest;

    /**
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public StudentInterest(Student student, SubInterest subInterest) {
        this.student = student;
        this.subInterest = subInterest;
    }
}
