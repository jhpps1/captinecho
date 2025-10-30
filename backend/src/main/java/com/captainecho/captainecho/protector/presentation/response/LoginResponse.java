package com.captainecho.captainecho.protector.presentation.response;

import com.captainecho.captainecho.protector.application.result.LoginResult;

public record LoginResponse(
        Long protectorId,
        String accessToken
) {
    public static LoginResponse from(LoginResult result) {
        return new LoginResponse(result.protectorId(), result.accessToken());
    }
}
