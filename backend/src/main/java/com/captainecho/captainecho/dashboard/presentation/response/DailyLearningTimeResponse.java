package com.captainecho.captainecho.dashboard.presentation.response;

import com.captainecho.captainecho.dashboard.application.result.DailyLearningTimeDto;

public record DailyLearningTimeResponse(
        String dayOfWeek,
        Integer learningMinutes
) {
    public static DailyLearningTimeResponse from(DailyLearningTimeDto dto) {
        return new DailyLearningTimeResponse(dto.dayOfWeek(), dto.learningMinutes());
    }
}
