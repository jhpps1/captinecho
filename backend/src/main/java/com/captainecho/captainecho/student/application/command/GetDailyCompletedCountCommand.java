package com.captainecho.captainecho.student.application.command;

public record GetDailyCompletedCountCommand(
        Integer studentId,
        Integer protectorId
) {
}
