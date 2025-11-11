package com.captainecho.captainecho.diagnosis.presentation.response;

import com.captainecho.captainecho.diagnosis.application.result.InitialDiagnosisProblemDto;
import com.captainecho.captainecho.diagnosis.domain.DiagnosisType;

public record InitialDiagnosisProblemResponse(
        Integer problemId,
        DiagnosisType diagnosisType,
        String problem,
        String[] choices,
        String problemImageUrl,
        String problemSoundUrl,
        String correctAnswer,
        String[] problemPhonemes,
        String blankPosition,
        String blankPhoneme
) {
    public static InitialDiagnosisProblemResponse from(InitialDiagnosisProblemDto dto) {
        return new InitialDiagnosisProblemResponse(
                dto.initialDiagnosisProblemId(),
                dto.diagnosisType(),
                dto.problem(),
                dto.choices(),
                dto.problemImageUrl(),
                dto.problemSoundUrl(),
                dto.correctAnswer(),
                dto.problemPhonemes(),
                dto.blankPosition(),
                dto.blankPhoneme()
        );
    }
}
