package com.captainecho.captainecho.student.application.command;

import com.captainecho.captainecho.stats.domain.ProtectorGoal;

public record SetProtectorGoalCommand(
        Integer studentId,
        Long protectorId,
        ProtectorGoal protectorGoal
) {
}
