package com.captainecho.captainecho.dashboard.presentation.response;

import com.captainecho.captainecho.dashboard.application.result.LearningTimeResult;

public record LearningTimeResponse(
        WeeklyLearningTimeResponse thisWeekLearningTime,
        WeeklyLearningTimeResponse lastWeekLearningTime
) {
    public static LearningTimeResponse from(LearningTimeResult result) {
        return new LearningTimeResponse(
                WeeklyLearningTimeResponse.from(result.thisWeekLearningTime()),
                WeeklyLearningTimeResponse.from(result.lastWeekLearningTime())
        );
    }
}
