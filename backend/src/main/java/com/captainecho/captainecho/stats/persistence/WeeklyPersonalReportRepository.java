package com.captainecho.captainecho.stats.persistence;

import com.captainecho.captainecho.stats.domain.WeeklyPersonalReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WeeklyPersonalReportRepository extends JpaRepository<WeeklyPersonalReport, Integer> {

    /**
     * 특정 학생의 가장 최근 주간 리포트 조회
     */
    Optional<WeeklyPersonalReport> findTopByStudent_StudentIdOrderByCreatedAtDesc(Integer studentId);

    /**
     * 특정 학생의 특정 기간 내 주간 리포트 목록 조회
     */
    List<WeeklyPersonalReport> findByStudent_StudentIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Integer studentId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * 특정 학생의 모든 주간 리포트 조회 (최신순)
     */
    List<WeeklyPersonalReport> findByStudent_StudentIdOrderByCreatedAtDesc(Integer studentId);
}
