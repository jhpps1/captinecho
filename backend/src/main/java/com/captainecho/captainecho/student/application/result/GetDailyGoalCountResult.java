package com.captainecho.captainecho.student.application.result;

public record GetDailyGoalCountResult(
        Integer todayGoalCount
) {
    public static GetDailyGoalCountResult from(Integer todayGoalCount) {
        return new GetDailyGoalCountResult(todayGoalCount);
    }
}
