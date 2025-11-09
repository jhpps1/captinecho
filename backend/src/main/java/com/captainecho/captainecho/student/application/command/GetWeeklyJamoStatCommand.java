package com.captainecho.captainecho.student.application.command;

public record GetWeeklyJamoStatCommand(
        Integer studentId,
        Integer protectorId
) {
}
