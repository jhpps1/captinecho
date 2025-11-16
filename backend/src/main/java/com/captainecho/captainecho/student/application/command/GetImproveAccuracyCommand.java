package com.captainecho.captainecho.student.application.command;

public record GetImproveAccuracyCommand(
        Integer protectorId,
        Integer studentId
) {
}
