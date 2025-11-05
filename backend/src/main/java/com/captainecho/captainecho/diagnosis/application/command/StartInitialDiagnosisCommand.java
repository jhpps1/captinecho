package com.captainecho.captainecho.diagnosis.application.command;

public record StartInitialDiagnosisCommand(
        Integer studentId,
        Long protectorId
) {
}
