package com.captainecho.captainecho.adventure.persistence;

import com.captainecho.captainecho.adventure.domain.DayProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

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
}
