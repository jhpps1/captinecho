package com.captainecho.captainecho.session.persistence;

import com.captainecho.captainecho.session.domain.LearningSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LearningSessionRepository extends JpaRepository<LearningSession, Integer> {

    /**
     * 특정 학생의 특정 기간 내 학습 세션 조회
     */
    List<LearningSession> findByStudent_StudentIdAndStartTimeBetween(
            Integer studentId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * 특정 학생의 요일별 학습 시간 집계 (분 단위)
     * PostgreSQL의 EXTRACT(DOW FROM ...) 사용:
     * - 0 = 일요일
     * - 1 = 월요일
     * - 2 = 화요일
     * - 3 = 수요일
     * - 4 = 목요일
     * - 5 = 금요일
     * - 6 = 토요일
     *
     * 반환값: Object[] { dayOfWeek (Integer), totalMinutes (Double) }
     */
    @Query(value = """
            SELECT EXTRACT(DOW FROM start_time) as dayOfWeek,
                   SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 60.0) as totalMinutes
            FROM learning_session
            WHERE student_id = :studentId
              AND start_time >= :startDate
              AND start_time < :endDate
            GROUP BY EXTRACT(DOW FROM start_time)
            ORDER BY dayOfWeek
            """, nativeQuery = true)
    List<Object[]> findDailyLearningMinutesByStudentAndDateRange(
            @Param("studentId") Integer studentId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * 특정 학생의 특정 기간 내 총 학습 시간 (분 단위)
     */
    @Query(value = """
            SELECT SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 60.0)
            FROM learning_session
            WHERE student_id = :studentId
              AND start_time >= :startDate
              AND start_time < :endDate
            """, nativeQuery = true)
    Double findTotalLearningMinutesByStudentAndDateRange(
            @Param("studentId") Integer studentId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
