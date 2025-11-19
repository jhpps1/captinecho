package com.captainecho.captainecho.student.application.command;

public record GetCurrentJamoStatCommand(
        Integer protectorId,
        Integer studentId
) {
}
