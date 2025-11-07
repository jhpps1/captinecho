package com.captainecho.captainecho.student.application.command;

public record DeleteStudentCommand(
        Integer protectorId,
        Integer studentId
) {
}
