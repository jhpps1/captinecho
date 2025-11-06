package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.SetProtectorGoalResult;

public record SetProtectorGoalResponse(
        Boolean success
) {
    public static SetProtectorGoalResponse from(SetProtectorGoalResult result) {
        return new SetProtectorGoalResponse(result.success());
    }
}
