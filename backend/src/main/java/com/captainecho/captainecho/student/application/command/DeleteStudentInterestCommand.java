package com.captainecho.captainecho.student.application.command;

public record DeleteStudentInterestCommand(
        Integer studentId,
        Integer studentInterestId,
        Integer protectorId
) {
}
