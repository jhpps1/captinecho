package com.captainecho.captainecho.dashboard.presentation.response;

import com.captainecho.captainecho.dashboard.application.result.WeeklyLearningTimeDto;

import java.util.List;
import java.util.stream.Collectors;

public record WeeklyLearningTimeResponse(
        Integer totalMinutes,
        List<DailyLearningTimeResponse> daily
) {
    public static WeeklyLearningTimeResponse from(WeeklyLearningTimeDto dto) {
        List<DailyLearningTimeResponse> dailyResponses = dto.daily().stream()
                .map(DailyLearningTimeResponse::from)
                .collect(Collectors.toList());

        return new WeeklyLearningTimeResponse(dto.totalMinutes(), dailyResponses);
    }
}
