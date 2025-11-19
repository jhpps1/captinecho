package com.captainecho.captainecho.student.application.command;

public record GetDailyAccuracyCommand(
        Integer protectorId,
        Integer studentId
) {
}
