package com.captainecho.captainecho.student.application.command;

public record DeleteStudentCommand(
        Long protectorId,
        Integer studentId
) {
}
