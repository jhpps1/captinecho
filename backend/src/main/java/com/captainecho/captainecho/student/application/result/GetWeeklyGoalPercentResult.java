package com.captainecho.captainecho.student.application.result;

public record GetWeeklyGoalPercentResult(
        Integer weekGoalPercent,
        Integer goalCount,
        Integer completedCount
) {
    public static GetWeeklyGoalPercentResult from(Integer weekGoalPercent, Integer goalCount, Integer completedCount) {
        return new GetWeeklyGoalPercentResult(weekGoalPercent, goalCount, completedCount);
    }
}
