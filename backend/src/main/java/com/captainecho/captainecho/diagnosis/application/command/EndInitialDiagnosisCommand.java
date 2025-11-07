package com.captainecho.captainecho.diagnosis.application.command;

public record EndInitialDiagnosisCommand(
        Integer studentId,
        Integer protectorId
) {
}
