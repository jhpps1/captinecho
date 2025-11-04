package com.captainecho.captainecho.student.application.result;

public record GetDailyCompletedCountResult(
        Integer completedCount
) {
    public static GetDailyCompletedCountResult from(Integer completedCount) {
        return new GetDailyCompletedCountResult(completedCount);
    }
}
