package com.captainecho.captainecho.student.presentation.request;

import com.captainecho.captainecho.student.application.command.VerifyPinCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyPinRequest(
        @NotBlank(message = "PIN은 필수입니다")
        @Pattern(regexp = "^\\d{6}$", message = "PIN은 6자리 숫자여야합니다")
        String pin
) {
    public VerifyPinCommand toCommand(Integer studentId) {
        return new VerifyPinCommand(studentId, pin);
    }
}
