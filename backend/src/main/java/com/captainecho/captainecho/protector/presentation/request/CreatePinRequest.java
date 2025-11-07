package com.captainecho.captainecho.protector.presentation.request;

import com.captainecho.captainecho.protector.application.command.CreatePinCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreatePinRequest(
        @NotBlank(message = "PIN은 필수입니다")
        @Pattern(regexp = "^[0-9]{6}$", message = "PIN은 6자리 숫자여야 합니다")
        String pin
) {
    public CreatePinCommand toCommand(Integer protectorId) {
        return new CreatePinCommand(protectorId, pin);
    }
}
