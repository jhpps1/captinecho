package com.captainecho.captainecho.diagnosis.application.command;

public record EndInitialDiagnosisCommand(
        Integer studentId,
        Long protectorId
) {
}
