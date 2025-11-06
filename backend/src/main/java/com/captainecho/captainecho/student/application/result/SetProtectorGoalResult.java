package com.captainecho.captainecho.student.application.result;

public record SetProtectorGoalResult(
        Boolean success
) {
    public static SetProtectorGoalResult from(Boolean success) {
        return new SetProtectorGoalResult(success);
    }
}
