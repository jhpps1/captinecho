package com.captainecho.captainecho.student.application.result;

public record GetWeeklyGoalPercentResult(
        Integer weekGoalPercent
) {
    public static GetWeeklyGoalPercentResult from(Integer weekGoalPercent) {
        return new GetWeeklyGoalPercentResult(weekGoalPercent);
    }
}
