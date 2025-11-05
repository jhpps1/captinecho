package com.captainecho.captainecho.student.application.command;

public record GetStudentInterestCommand(
        Integer studentId,
        Long protectorId
) {
}
