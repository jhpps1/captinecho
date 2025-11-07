package com.captainecho.captainecho.student.application.command;

public record GetSupplementaryProblemsCommand(
        Integer studentId,
        Integer protectorId,
        Integer adventureTypeId
) {
}
