package com.captainecho.captainecho.diagnosis.presentation.request;

import com.captainecho.captainecho.diagnosis.application.command.SubmitDiagnosisResultCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.stream.Collectors;

public record SubmitDiagnosisResultRequest(
        @NotEmpty List<@Valid DiagnosisAnswerRequest> results
) {
    public SubmitDiagnosisResultCommand toCommand(Integer studentId, Integer protectorId) {
        List<SubmitDiagnosisResultCommand.DiagnosisAnswer> answers = results.stream()
                .map(r -> new SubmitDiagnosisResultCommand.DiagnosisAnswer(
                        r.questionId(),
                        r.answer()
                ))
                .collect(Collectors.toList());

        return new SubmitDiagnosisResultCommand(studentId, protectorId, answers);
    }

    public record DiagnosisAnswerRequest(
            @NotNull Integer questionId,
            @NotNull String answer
    ) {
    }
}
