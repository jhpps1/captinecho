package com.captainecho.captainecho.student.presentation.request;

import com.captainecho.captainecho.student.application.command.RegisterStudentCommand;
import com.captainecho.captainecho.student.domain.Gender;
import com.captainecho.captainecho.student.domain.Grade;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record RegisterStudentRequest(
        @NotNull(message = "이름은 필수입니다")
        String studentName,

        @NotNull(message = "성별은 필수입니다")
        Gender gender,

        @NotNull(message = "생년월일은 필수입니다")
        @Past(message = "생년월일은 과거 날짜여야 합니다")
        LocalDate birth,

        @NotNull(message = "학년은 필수입니다")
        Grade grade,

        @Size(max = 5, message = "관심사는 최대 5개까지 등록 가능합니다")
        @Valid
        List<Interest> interests
) {
    public record Interest(
            @NotNull(message = "관심사 ID는 필수입니다")
            Long interestId
    ) {}

    public RegisterStudentCommand toCommand(Long protectorId) {
        List<Long> interestIds = (interests == null || interests.isEmpty())
                ? List.of()
                : interests.stream()
                        .map(Interest::interestId)
                        .toList();

        return new RegisterStudentCommand(
                protectorId,
                studentName,
                gender,
                birth,
                grade,
                interestIds
        );
    }
}
