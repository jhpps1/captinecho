package com.captainecho.captainecho.student.presentation.request;

import com.captainecho.captainecho.student.application.command.RecordAnswerCommand;
import jakarta.validation.constraints.NotNull;

public record RecordAnswerRequest(
        @NotNull Boolean isCorrect,
        String realJamo,
        String confusionJamo,
        String phonemePosition
) {
    public RecordAnswerCommand toCommand(Integer studentId, Integer protectorId) {
        return new RecordAnswerCommand(
                studentId,
                protectorId,
                isCorrect,
                realJamo,
                confusionJamo,
                phonemePosition
        );
    }
}
