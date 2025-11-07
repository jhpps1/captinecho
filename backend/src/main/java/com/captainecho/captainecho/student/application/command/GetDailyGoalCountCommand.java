package com.captainecho.captainecho.student.application.command;

public record GetDailyGoalCountCommand(
        Integer studentId,
        Integer protectorId
) {
}
