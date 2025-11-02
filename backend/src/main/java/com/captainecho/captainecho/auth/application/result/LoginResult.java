package com.captainecho.captainecho.auth.application.result;

public record LoginResult(
        Long protectorId,
        String accessToken
) {
}
