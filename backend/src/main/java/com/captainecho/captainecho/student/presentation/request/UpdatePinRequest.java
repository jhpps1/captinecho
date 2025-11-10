package com.captainecho.captainecho.student.presentation.request;

import com.captainecho.captainecho.student.application.command.UpdatePinCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdatePinRequest(
        @NotBlank(message = "현재 PIN은 필수입니다")
        @Pattern(regexp = "^[0-9]{6}$", message = "현재 PIN은 6자리 숫자여야 합니다")
        String currentPin,

        @NotBlank(message = "새 PIN은 필수입니다")
        @Pattern(regexp = "^[0-9]{6}$", message = "새 PIN은 6자리 숫자여야 합니다")
        String newPin
) {
    public UpdatePinCommand toCommand(Integer studentId) {
        return new UpdatePinCommand(studentId, currentPin, newPin);
    }
}
