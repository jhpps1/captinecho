package com.captainecho.captainecho.diagnosis.application.command;

import java.util.List;

public record SubmitDiagnosisResultCommand(
        Integer studentId,
        Integer protectorId,
        List<DiagnosisAnswer> results
) {
    public record DiagnosisAnswer(
            Integer questionId,
            String answer
    ) {
    }
}
