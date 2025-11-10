package com.captainecho.captainecho.student.application.command;

import com.captainecho.captainecho.student.domain.Gender;
import com.captainecho.captainecho.student.domain.Grade;

import java.time.LocalDate;
import java.util.List;

public record RegisterStudentCommand(
        Integer protectorId,
        String studentName,
        Gender gender,
        LocalDate birth,
        Grade grade,
        String studentPin,
        List<Long> interestIds
) {
}
