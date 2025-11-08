package com.captainecho.captainecho.dashboard.application.result;

import com.captainecho.captainecho.stats.domain.ProtectorGoal;

public record GetProtectorGoalResult(
        String protectorGoal
) {
    public static GetProtectorGoalResult from(ProtectorGoal goal) {
        return new GetProtectorGoalResult(
                goal != null ? goal.name() : null
        );
    }
}
