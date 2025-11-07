package com.captainecho.captainecho.auth.presentation.response;

import com.captainecho.captainecho.auth.application.result.LoginResult;

public record LoginResponse(
        Integer protectorId,
        String accessToken
) {
    public static LoginResponse from(LoginResult result) {
        return new LoginResponse(result.protectorId(), result.accessToken());
    }
}
