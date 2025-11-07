package com.captainecho.captainecho.protector.presentation.dto;

import com.captainecho.captainecho.protector.application.command.VerifyPinCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyPinRequest(
        @NotBlank(message = "PIN은 필수입니다")
        @Pattern(regexp = "^\\d{6}$", message = "PIN은 6자리 숫자여야합니다")
        String pin
) {
    public VerifyPinCommand toCommand(Integer protectorId) {
        return new VerifyPinCommand(protectorId, pin);
    }
}
