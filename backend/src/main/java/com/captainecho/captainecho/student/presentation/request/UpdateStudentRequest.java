package com.captainecho.captainecho.student.presentation.request;

import com.captainecho.captainecho.student.application.command.UpdateStudentCommand;
import com.captainecho.captainecho.student.domain.Gender;
import com.captainecho.captainecho.student.domain.Grade;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;

public record UpdateStudentRequest(
        @NotNull(message = "이름은 필수입니다")
        String studentName,

        @NotNull(message = "성별은 필수입니다")
        Gender gender,

        @NotNull(message = "생년월일은 필수입니다")
        @Past(message = "생년월일은 과거 날짜여야 합니다")
        LocalDate birth,

        @NotNull(message = "학년은 필수입니다")
        Grade grade
) {
    public UpdateStudentCommand toCommand(Integer protectorId, Integer studentId) {
        return new UpdateStudentCommand(
                protectorId,
                studentId,
                studentName,
                gender,
                birth,
                grade
        );
    }
}
