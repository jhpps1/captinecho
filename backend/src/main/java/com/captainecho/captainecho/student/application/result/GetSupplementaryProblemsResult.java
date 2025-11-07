package com.captainecho.captainecho.student.application.result;

import com.captainecho.captainecho.adventure.domain.BlankPosition;

import java.time.LocalDate;
import java.util.List;

public record GetSupplementaryProblemsResult(
        List<ProblemInfo> problems
) {
    public static GetSupplementaryProblemsResult of(List<ProblemInfo> problems) {
        return new GetSupplementaryProblemsResult(problems);
    }

    public record ProblemInfo(
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
