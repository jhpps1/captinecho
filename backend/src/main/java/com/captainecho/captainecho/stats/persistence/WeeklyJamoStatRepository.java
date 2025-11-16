package com.captainecho.captainecho.stats.persistence;

import com.captainecho.captainecho.stats.domain.WeeklyJamoStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WeeklyJamoStatRepository extends JpaRepository<WeeklyJamoStat, Integer> {
    /**
     * 특정 학생의 가장 최근 주간 자모 통계 조회
     */
    @Query("""
            SELECT wjs
            FROM WeeklyJamoStat wjs
            WHERE wjs.student.studentId = :studentId
              AND wjs.weeklyPersonalReport.reportId = (
                  SELECT MAX(wpr.reportId)
                  FROM WeeklyPersonalReport wpr
                  WHERE wpr.student.studentId = :studentId
              )
            ORDER BY wjs.jamo ASC
            """)
    List<WeeklyJamoStat> findLatestWeeklyStatsByStudentId(@Param("studentId") Integer studentId);

    /**
     * 특정 리포트의 모든 자모 통계 조회
     */
    List<WeeklyJamoStat> findAllByWeeklyPersonalReport_ReportId(Integer reportId);

    /**
     * 특정 학생의 모든 주차 자모 통계 조회 (전체 학습 분석용)
     */
    @Query("""
            SELECT wjs
            FROM WeeklyJamoStat wjs
            WHERE wjs.student.studentId = :studentId
            ORDER BY wjs.jamo ASC
            """)
    List<WeeklyJamoStat> findAllWeeklyStatsByStudentId(@Param("studentId") Integer studentId);
}
