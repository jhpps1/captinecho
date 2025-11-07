package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.adventure.domain.BlankPosition;
import com.captainecho.captainecho.student.application.result.GetSupplementaryProblemsResult;

import java.time.LocalDate;
import java.util.List;

public record GetSupplementaryProblemsResponse(
        List<Problem> problems
) {
    public static GetSupplementaryProblemsResponse from(GetSupplementaryProblemsResult result) {
        List<Problem> problems = result.problems().stream()
                .map(p -> new Problem(
                        p.dayProblemId(),
                        p.studentId(),
                        p.interestId(),
                        p.adventureTypeId(),
                        p.assignedDate(),
                        p.seqNo(),
                        p.level(),
                        p.questionText(),
                        p.hint(),
                        p.imageUrl(),
                        p.soundUrl(),
                        p.questionPhonemes(),
                        p.blankPosition(),
                        p.blankPhoneme(),
                        p.choices(),
                        p.correctAnswer(),
                        p.isCompleted()
                ))
                .toList();

        return new GetSupplementaryProblemsResponse(problems);
    }

    public record Problem(
            Integer dayProblemId,
            Integer studentId,
            Short interestId,
            Integer adventureTypeId,
            LocalDate assignedDate,
            Short seqNo,
            Short level,
            String questionText,
            String hint,
            String imageUrl,
            String soundUrl,
            List<String> questionPhonemes,
            BlankPosition blankPosition,
            String blankPhoneme,
            List<String> choices,
            String correctAnswer,
            Boolean isCompleted
    ) {
    }
}
