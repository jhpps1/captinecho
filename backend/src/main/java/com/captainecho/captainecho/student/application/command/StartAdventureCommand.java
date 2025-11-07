package com.captainecho.captainecho.student.application.command;

import com.captainecho.captainecho.session.domain.StudyType;

public record StartAdventureCommand(
        Integer studentId,
        Integer protectorId,
        StudyType studyType
) {
}
