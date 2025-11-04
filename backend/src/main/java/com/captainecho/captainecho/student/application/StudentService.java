package com.captainecho.captainecho.student.application;

import com.captainecho.captainecho.adventure.persistence.DayProblemRepository;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import com.captainecho.captainecho.student.application.command.GetDailyCompletedCountCommand;
import com.captainecho.captainecho.student.application.command.GetDailyGoalCountCommand;
import com.captainecho.captainecho.student.application.result.GetDailyCompletedCountResult;
import com.captainecho.captainecho.student.application.result.GetDailyGoalCountResult;
import com.captainecho.captainecho.student.persistence.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class StudentService {

    private final StudentRepository studentRepository;
    private final DayProblemRepository dayProblemRepository;

    @Transactional(readOnly = true)
    public GetDailyGoalCountResult getDailyGoalCount(GetDailyGoalCountCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 오늘 할당된 문제 개수 조회
        Integer todayGoalCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDate(
                command.studentId(),
                LocalDate.now()
        );

        return GetDailyGoalCountResult.from(todayGoalCount);
    }

    @Transactional(readOnly = true)
    public GetDailyCompletedCountResult getDailyCompletedCount(GetDailyCompletedCountCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 오늘 완료한 문제 개수 조회 (isCompleted = true)
        Integer completedCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDateAndIsCompleted(
                command.studentId(),
                LocalDate.now(),
                true
        );

        return GetDailyCompletedCountResult.from(completedCount);
    }
}
