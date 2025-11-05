package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetWeeklyGoalPercentResult;

public record GetWeeklyGoalPercentResponse(
        Integer weekGoalPercent
) {
    public static GetWeeklyGoalPercentResponse from(GetWeeklyGoalPercentResult result) {
        return new GetWeeklyGoalPercentResponse(result.weekGoalPercent());
    }
}
