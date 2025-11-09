package com.captainecho.captainecho.diagnosis.application.result;

import com.captainecho.captainecho.diagnosis.domain.DiagnosisType;

import java.util.List;

public record GetDiagnosisResultResult(
        Integer studentId,
        Integer totalScore,
        Integer totalCount,
        Integer correctCount,
        List<DiagnosisTypeResult> diagnosisResults
) {
    public static GetDiagnosisResultResult of(
            Integer studentId,
            Integer totalScore,
            Integer totalCount,
            Integer correctCount,
            List<DiagnosisTypeResult> diagnosisResults
    ) {
        return new GetDiagnosisResultResult(
                studentId,
                totalScore,
                totalCount,
                correctCount,
                diagnosisResults
        );
    }

    public record DiagnosisTypeResult(
            DiagnosisType diagnosisType,
            Integer totalCount,
            Integer correctCount,
            Integer score,
            List<DetailedResult> detailedResults
    ) {
    }

    public record DetailedResult(
            Integer initialDiagnosisResultId,
            Integer initialDiagnosisProblemId,
            DiagnosisType diagnosisType,
            String problem,
            String studentAnswer,
            String correctAnswer,
            Boolean isCorrect
    ) {
    }
}
