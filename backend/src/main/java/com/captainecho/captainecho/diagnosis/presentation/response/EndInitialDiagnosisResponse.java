package com.captainecho.captainecho.diagnosis.presentation.response;

import com.captainecho.captainecho.diagnosis.application.result.EndInitialDiagnosisResult;

import java.time.LocalDateTime;

public record EndInitialDiagnosisResponse(
        Integer studentId,
        LocalDateTime startTime,
        LocalDateTime endTime
) {
    public static EndInitialDiagnosisResponse from(EndInitialDiagnosisResult result) {
        return new EndInitialDiagnosisResponse(
                result.studentId(),
                result.startTime(),
                result.endTime()
        );
    }
}
