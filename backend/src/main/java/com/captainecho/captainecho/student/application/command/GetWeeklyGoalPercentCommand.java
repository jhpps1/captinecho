package com.captainecho.captainecho.student.application.command;

public record GetWeeklyGoalPercentCommand(
        Integer studentId,
        Long protectorId
) {
}
