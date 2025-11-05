package com.captainecho.captainecho.diagnosis.presentation.response;

import com.captainecho.captainecho.diagnosis.application.result.StartInitialDiagnosisResult;

public record StartInitialDiagnosisResponse(
        Integer studentId
) {
    public static StartInitialDiagnosisResponse from(StartInitialDiagnosisResult result) {
        return new StartInitialDiagnosisResponse(result.studentId());
    }
}
