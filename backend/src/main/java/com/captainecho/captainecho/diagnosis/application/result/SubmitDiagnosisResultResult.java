package com.captainecho.captainecho.diagnosis.application.result;

public record SubmitDiagnosisResultResult(
        Boolean success
) {
    public static SubmitDiagnosisResultResult from(Boolean success) {
        return new SubmitDiagnosisResultResult(success);
    }
}
