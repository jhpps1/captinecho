package com.captainecho.captainecho.protector.presentation.request;

import com.captainecho.captainecho.protector.application.command.UpdateEmailCommand;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateEmailRequest(
        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        String email
) {
    public UpdateEmailCommand toCommand(Integer protectorId) {
        return new UpdateEmailCommand(protectorId, email);
    }
}
