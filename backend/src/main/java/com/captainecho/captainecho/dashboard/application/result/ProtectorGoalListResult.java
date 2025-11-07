package com.captainecho.captainecho.dashboard.application.result;

import com.captainecho.captainecho.stats.domain.ProtectorGoal;

import java.util.Arrays;
import java.util.List;

public record ProtectorGoalListResult(
        List<GoalInfo> goals
) {
    public record GoalInfo(
            String goal,
            String title,
            String description
    ) {
        public static GoalInfo from(ProtectorGoal protectorGoal) {
            return new GoalInfo(
                    protectorGoal.name(),
                    protectorGoal.getTitle(),
                    protectorGoal.getDescription()
            );
        }
    }

    public static ProtectorGoalListResult fromEnum() {
        List<GoalInfo> goals = Arrays.stream(ProtectorGoal.values())
                .map(GoalInfo::from)
                .toList();
        return new ProtectorGoalListResult(goals);
    }
}
