package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetDailyGoalCountResult;

public record GetDailyGoalCountResponse(
        Integer todayGoalCount
) {
    public static GetDailyGoalCountResponse from(GetDailyGoalCountResult result) {
        return new GetDailyGoalCountResponse(result.todayGoalCount());
    }
}
