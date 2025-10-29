package com.captainecho.captainecho.protector.presentation.request;

import com.captainecho.captainecho.protector.application.command.LoginCommand;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "ID 토큰은 필수입니다")
        String idToken,

        @NotBlank(message = "소셜 제공자는 필수입니다")
        String provider
) {
    public LoginCommand toCommand() {
        return new LoginCommand(idToken, provider);
    }
}
