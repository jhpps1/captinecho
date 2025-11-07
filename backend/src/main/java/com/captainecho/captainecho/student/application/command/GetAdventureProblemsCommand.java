package com.captainecho.captainecho.student.application.command;

public record GetAdventureProblemsCommand(
        Integer studentId,
        Integer protectorId
) {
}
