package com.captainecho.captainecho.protector.presentation.request;

import com.captainecho.captainecho.protector.application.command.UpdatePinCommand;
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
    public UpdatePinCommand toCommand(Integer protectorId) {
        return new UpdatePinCommand(protectorId, currentPin, newPin);
    }
}
