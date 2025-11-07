package com.captainecho.captainecho.student.application.command;

import java.util.List;

public record AddStudentInterestCommand(
        Integer studentId,
        Integer protectorId,
        List<Short> subInterestIds
) {
}
