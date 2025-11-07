package com.captainecho.captainecho.diagnosis.application.result;

import java.time.LocalDateTime;

public record EndInitialDiagnosisResult(
        Integer studentId,
        LocalDateTime startTime,
        LocalDateTime endTime
) {
}
