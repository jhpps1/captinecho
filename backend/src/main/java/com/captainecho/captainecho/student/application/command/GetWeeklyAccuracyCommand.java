package com.captainecho.captainecho.student.application.command;

public record GetWeeklyAccuracyCommand(
        Integer protectorId,
        Integer studentId
) {
}
