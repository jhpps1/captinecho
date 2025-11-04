package com.captainecho.captainecho.dashboard.presentation.response;

import com.captainecho.captainecho.dashboard.application.result.CurriculumResult;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CurriculumResponse(
        @JsonProperty("curriculam")  // API 명세서에 명시된 필드명 (오타 포함)
        String curriculam
) {
    public static CurriculumResponse from(CurriculumResult result) {
        return new CurriculumResponse(result.curriculum());
    }
}
