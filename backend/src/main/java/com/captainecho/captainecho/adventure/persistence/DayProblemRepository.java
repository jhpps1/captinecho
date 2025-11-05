package com.captainecho.captainecho.adventure.persistence;

import com.captainecho.captainecho.adventure.domain.DayProblem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface DayProblemRepository extends JpaRepository<DayProblem, Integer> {
    Integer countByStudent_StudentIdAndAssignedDate(Integer studentId, LocalDate assignedDate);

    Integer countByStudent_StudentIdAndAssignedDateAndIsCompleted(Integer studentId, LocalDate assignedDate, Boolean isCompleted);

    Integer countByStudent_StudentIdAndAssignedDateBetween(Integer studentId, LocalDate startDate, LocalDate endDate);

    Integer countByStudent_StudentIdAndAssignedDateBetweenAndIsCompleted(Integer studentId, LocalDate startDate, LocalDate endDate, Boolean isCompleted);
}
