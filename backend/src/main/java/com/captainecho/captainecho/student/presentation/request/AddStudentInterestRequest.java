package com.captainecho.captainecho.student.presentation.request;

import com.captainecho.captainecho.student.application.command.AddStudentInterestCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AddStudentInterestRequest(
        @NotNull(message = "관심사는 필수입니다")
        @Size(max = 5, message = "관심사는 최대 5개까지 등록 가능합니다")
        @Valid
        List<Interest> interests
) {
    public record Interest(
            @NotNull(message = "관심사 ID는 필수입니다")
            Long interestId
    ) {}

    public AddStudentInterestCommand toCommand(Integer studentId, Integer protectorId) {
        List<Short> subInterestIds = interests.stream()
                .map(interest -> interest.interestId().shortValue())
                .toList();

        return new AddStudentInterestCommand(
                studentId,
                protectorId,
                subInterestIds
        );
    }
}
