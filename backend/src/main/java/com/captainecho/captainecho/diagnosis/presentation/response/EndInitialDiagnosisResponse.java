package com.captainecho.captainecho.diagnosis.presentation.response;

import com.captainecho.captainecho.diagnosis.application.result.EndInitialDiagnosisResult;

public record EndInitialDiagnosisResponse(
        boolean success
) {
    public static EndInitialDiagnosisResponse from(EndInitialDiagnosisResult result) {
        return new EndInitialDiagnosisResponse(true);
    }
}
