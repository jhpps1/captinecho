package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetWeeklyGoalPercentResult;

public record GetWeeklyGoalPercentResponse(
        Integer weekGoalPercent,
        Integer goalCount,
        Integer completedCount
) {
    public static GetWeeklyGoalPercentResponse from(GetWeeklyGoalPercentResult result) {
        return new GetWeeklyGoalPercentResponse(result.weekGoalPercent(), result.goalCount(), result.completedCount());
    }
}
