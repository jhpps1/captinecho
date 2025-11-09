package com.captainecho.captainecho.student.application.command;

public record RecordAnswerCommand(
        Integer studentId,
        Integer protectorId,
        Boolean isCorrect,
        String realJamo,
        String confusionJamo,
        String phonemePosition,
        String studyType,
        Integer dayProblemId
) {
}
