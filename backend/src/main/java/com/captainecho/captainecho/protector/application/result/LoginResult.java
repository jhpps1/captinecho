package com.captainecho.captainecho.protector.application.result;

public record LoginResult(
        Long protectorId,
        String accessToken
) {
}
