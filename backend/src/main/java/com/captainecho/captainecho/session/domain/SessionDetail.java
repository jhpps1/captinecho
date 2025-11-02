package com.captainecho.captainecho.session.domain;

import com.captainecho.captainecho.adventure.domain.DayProblem;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 세션 상세 기록 Entity
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "session_detail")
public class SessionDetail {

    /**
     * 상세 기록 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_detail_id")
    private Integer sessionDetailId;

    /**
     * 세션 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private LearningSession learningSession;

    /**
     * 일일 문제 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_problem_id", nullable = false)
    private DayProblem dayProblem;

    /**
     * 힌트 사용 여부
     */
    @Column(name = "used_hint", nullable = false)
    @ColumnDefault("false")
    private Boolean usedHint = false;

    /**
     * 시도 횟수
     */
    @Column(name = "attempt_no", nullable = false)
    private Short attemptNo;

    /**
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public SessionDetail(LearningSession learningSession, DayProblem dayProblem, Boolean usedHint, Short attemptNo) {
        this.learningSession = learningSession;
        this.dayProblem = dayProblem;
        this.usedHint = usedHint != null ? usedHint : false;
        this.attemptNo = attemptNo;
    }
}
