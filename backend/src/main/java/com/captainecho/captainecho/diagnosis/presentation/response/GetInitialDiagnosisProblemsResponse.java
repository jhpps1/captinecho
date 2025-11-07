package com.captainecho.captainecho.diagnosis.presentation.response;

import com.captainecho.captainecho.diagnosis.application.result.GetInitialDiagnosisProblemsResult;

import java.util.List;

public record GetInitialDiagnosisProblemsResponse(
        List<InitialDiagnosisProblemResponse> problems
) {
    public static GetInitialDiagnosisProblemsResponse from(GetInitialDiagnosisProblemsResult result) {
        List<InitialDiagnosisProblemResponse> problems = result.problems().stream()
                .map(InitialDiagnosisProblemResponse::from)
                .toList();
        return new GetInitialDiagnosisProblemsResponse(problems);
    }
}
