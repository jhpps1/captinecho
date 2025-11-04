package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.GetDailyCompletedCountResult;

public record GetDailyCompletedCountResponse(
        Integer completedCount
) {
    public static GetDailyCompletedCountResponse from(GetDailyCompletedCountResult result) {
        return new GetDailyCompletedCountResponse(result.completedCount());
    }
}
