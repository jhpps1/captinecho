package com.captainecho.captainecho.diagnosis.application.result;

import com.captainecho.captainecho.diagnosis.domain.DiagnosisType;
import lombok.Builder;

@Builder
public record InitialDiagnosisProblemDto(
        Integer initialDiagnosisProblemId,
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
}
