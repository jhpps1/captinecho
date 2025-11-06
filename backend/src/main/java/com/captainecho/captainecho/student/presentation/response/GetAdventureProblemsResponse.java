package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.adventure.domain.BlankPosition;
import com.captainecho.captainecho.student.application.result.GetAdventureProblemsResult;

import java.time.LocalDate;
import java.util.List;

public record GetAdventureProblemsResponse(
        List<ProblemInfo> problems,
        Integer totalCount
) {
    public static GetAdventureProblemsResponse from(GetAdventureProblemsResult result) {
        List<ProblemInfo> problems = result.problems().stream()
                .map(p -> new ProblemInfo(
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

        return new GetAdventureProblemsResponse(problems, result.totalCount());
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
