package com.captainecho.captainecho.auth.application.result;

public record LoginResult(
        Integer protectorId,
        String accessToken
) {
}
