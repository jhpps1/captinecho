package com.captainecho.captainecho.student.presentation.request;

import com.captainecho.captainecho.session.domain.StudyType;
import com.captainecho.captainecho.student.application.command.StartAdventureCommand;
import jakarta.validation.constraints.NotNull;

public record StartAdventureRequest(
        @NotNull(message = "학습 타입은 필수입니다")
        StudyType studyType
) {
    public StartAdventureCommand toCommand(Integer studentId, Integer protectorId) {
        return new StartAdventureCommand(studentId, protectorId, studyType);
    }
}
