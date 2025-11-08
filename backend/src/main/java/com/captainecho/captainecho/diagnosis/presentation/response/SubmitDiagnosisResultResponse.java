package com.captainecho.captainecho.diagnosis.presentation.response;

import com.captainecho.captainecho.diagnosis.application.result.SubmitDiagnosisResultResult;

public record SubmitDiagnosisResultResponse(
        Boolean success
) {
    public static SubmitDiagnosisResultResponse from(SubmitDiagnosisResultResult result) {
        return new SubmitDiagnosisResultResponse(result.success());
    }
}
