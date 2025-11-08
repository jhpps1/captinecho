package com.captainecho.captainecho.diagnosis.application.result;

import java.util.List;

public record GetInitialDiagnosisProblemsResult(
        List<InitialDiagnosisProblemDto> problems
) {
}
