package com.captainecho.captainecho.auth.presentation.request;

import com.captainecho.captainecho.auth.application.command.LocalLoginCommand;
import jakarta.validation.constraints.NotBlank;

public record LocalLoginRequest(
        @NotBlank(message = "아이디는 필수입니다")
        String username,

        @NotBlank(message = "비밀번호는 필수입니다")
        String password
) {
    public LocalLoginCommand toCommand() {
        return new LocalLoginCommand(username, password);
    }
}
