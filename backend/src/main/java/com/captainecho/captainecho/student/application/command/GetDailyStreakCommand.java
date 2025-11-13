package com.captainecho.captainecho.student.application.command;

public record GetDailyStreakCommand(
        Integer protectorId,
        Integer studentId
) {
}
