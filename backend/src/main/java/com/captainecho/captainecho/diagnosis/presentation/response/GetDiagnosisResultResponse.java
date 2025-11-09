package com.captainecho.captainecho.diagnosis.presentation.response;

import com.captainecho.captainecho.diagnosis.application.result.GetDiagnosisResultResult;

import java.util.List;
import java.util.stream.Collectors;

public record GetDiagnosisResultResponse(
        Integer studentId,
        Integer totalScore,
        Integer totalCount,
        Integer correctCount,
        List<DiagnosisTypeResponse> diagnosisResults
) {
    public static GetDiagnosisResultResponse from(GetDiagnosisResultResult result) {
        List<DiagnosisTypeResponse> diagnosisResults = result.diagnosisResults().stream()
                .map(dr -> new DiagnosisTypeResponse(
                        dr.diagnosisType().name(),
                        dr.totalCount(),
                        dr.correctCount(),
                        dr.score()
                ))
                .collect(Collectors.toList());

        return new GetDiagnosisResultResponse(
                result.studentId(),
                result.totalScore(),
                result.totalCount(),
                result.correctCount(),
                diagnosisResults
        );
    }

    public record DiagnosisTypeResponse(
            String diagnosisType,
            Integer totalCount,
            Integer correctCount,
            Integer score
    ) {
    }
}
