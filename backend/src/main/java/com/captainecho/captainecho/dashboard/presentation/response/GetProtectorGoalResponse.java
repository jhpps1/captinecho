package com.captainecho.captainecho.dashboard.presentation.response;

import com.captainecho.captainecho.dashboard.application.result.GetProtectorGoalResult;

public record GetProtectorGoalResponse(
        String protectorGoal
) {
    public static GetProtectorGoalResponse from(GetProtectorGoalResult result) {
        return new GetProtectorGoalResponse(result.protectorGoal());
    }
}
