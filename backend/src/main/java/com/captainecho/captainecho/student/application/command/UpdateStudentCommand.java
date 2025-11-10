package com.captainecho.captainecho.student.application.command;

import com.captainecho.captainecho.student.domain.Gender;
import com.captainecho.captainecho.student.domain.Grade;

import java.time.LocalDate;

public record UpdateStudentCommand(
        Integer protectorId,
        Integer studentId,
        String studentName,
        Gender gender,
        LocalDate birth,
        Grade grade
) {
}
