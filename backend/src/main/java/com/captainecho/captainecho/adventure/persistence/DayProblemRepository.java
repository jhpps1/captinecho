package com.captainecho.captainecho.adventure.persistence;

import com.captainecho.captainecho.adventure.domain.DayProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DayProblemRepository extends JpaRepository<DayProblem, Integer> {
    Integer countByStudent_StudentIdAndAssignedDate(Integer studentId, LocalDate assignedDate);

    Integer countByStudent_StudentIdAndAssignedDateAndIsCompleted(Integer studentId, LocalDate assignedDate, Boolean isCompleted);

    Integer countByStudent_StudentIdAndAssignedDateBetween(Integer studentId, LocalDate startDate, LocalDate endDate);

    Integer countByStudent_StudentIdAndAssignedDateBetweenAndIsCompleted(Integer studentId, LocalDate startDate, LocalDate endDate, Boolean isCompleted);

    /**
     * 특정 학생의 특정 날짜 문제 목록 조회 (seq_no 순으로 정렬)
     */
    List<DayProblem> findByStudent_StudentIdAndAssignedDateOrderBySeqNoAsc(Integer studentId, LocalDate assignedDate);

    /**
     * 특정 학생의 특정 날짜 미완료 문제 목록 조회 (seq_no 순으로 정렬, fetch join)
     */
    @Query("""
            SELECT dp
            FROM DayProblem dp
            JOIN FETCH dp.student
            JOIN FETCH dp.subInterest si
            JOIN FETCH si.majorInterest
            JOIN FETCH dp.adventureType
            WHERE dp.student.studentId = :studentId
              AND dp.assignedDate = :assignedDate
              AND dp.isCompleted = :isCompleted
            ORDER BY dp.seqNo ASC
            """)
    List<DayProblem> findByStudent_StudentIdAndAssignedDateAndIsCompletedOrderBySeqNoAsc(
            @Param("studentId") Integer studentId,
            @Param("assignedDate") LocalDate assignedDate,
            @Param("isCompleted") Boolean isCompleted
    );

    /**
     * 특정 탐험 타입과 레벨에 맞는 랜덤 문제 ID 10개 조회 (추가 학습용)
     * Native Query는 Fetch Join을 지원하지 않으므로 ID만 조회
     */
    @Query(value = """
            SELECT dp.day_problem_id
            FROM day_problem dp
            WHERE dp.adventure_type_id = :adventureTypeId
              AND dp.level = :level
            ORDER BY RANDOM()
            LIMIT 10
            """, nativeQuery = true)
    List<Integer> findRandomSupplementaryProblemIds(
            @Param("adventureTypeId") Integer adventureTypeId,
            @Param("level") Short level
    );

    /**
     * 특정 문제 ID로 문제와 학생 정보를 함께 조회 (Fetch Join으로 LazyInitializationException 방지)
     */
    @Query("""
            SELECT dp
            FROM DayProblem dp
            JOIN FETCH dp.student
            WHERE dp.dayProblemId = :dayProblemId
            """)
    Optional<DayProblem> findByIdWithStudent(@Param("dayProblemId") Integer dayProblemId);

    /**
     * 문제 ID 리스트로 문제들을 연관 엔티티와 함께 조회 (Fetch Join으로 N+1 방지)
     */
    @Query("""
            SELECT dp
            FROM DayProblem dp
            JOIN FETCH dp.student
            JOIN FETCH dp.subInterest si
            JOIN FETCH si.majorInterest
            JOIN FETCH dp.adventureType
            WHERE dp.dayProblemId IN :problemIds
            """)
    List<DayProblem> findByIdInWithAssociations(@Param("problemIds") List<Integer> problemIds);
}
