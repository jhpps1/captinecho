package com.captainecho.captainecho.student.presentation.request;

import com.captainecho.captainecho.stats.domain.ProtectorGoal;
import com.captainecho.captainecho.student.application.command.SetProtectorGoalCommand;
import jakarta.validation.constraints.NotNull;

public record SetProtectorGoalRequest(
        @NotNull(message = "보호자 학습 목표는 필수입니다")
        ProtectorGoal protectorGoal
) {
    public SetProtectorGoalCommand toCommand(Integer studentId, Long protectorId) {
        return new SetProtectorGoalCommand(studentId, protectorId, protectorGoal);
    }
}
