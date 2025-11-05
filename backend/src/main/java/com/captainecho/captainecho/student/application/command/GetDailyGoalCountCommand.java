package com.captainecho.captainecho.student.application.command;

public record GetDailyGoalCountCommand(
        Integer studentId,
        Long protectorId
) {
}
