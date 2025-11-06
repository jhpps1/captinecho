package com.captainecho.captainecho.dashboard.presentation.response;

import com.captainecho.captainecho.dashboard.application.result.ProtectorGoalListResult;

import java.util.List;

public record ProtectorGoalListResponse(
        List<GoalInfo> goals
) {
    public record GoalInfo(
            String goal,
            String title,
            String description
    ) {
        public static GoalInfo from(ProtectorGoalListResult.GoalInfo goalInfo) {
            return new GoalInfo(
                    goalInfo.goal(),
                    goalInfo.title(),
                    goalInfo.description()
            );
        }
    }

    public static ProtectorGoalListResponse from(ProtectorGoalListResult result) {
        List<GoalInfo> goals = result.goals().stream()
                .map(GoalInfo::from)
                .toList();
        return new ProtectorGoalListResponse(goals);
    }
}
